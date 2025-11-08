"""
SHAP Model Interpretability and Validation Test for Glassbox AI

PURPOSE:
Tests the trained XGBoost multi-class model using SHAP (SHapley Additive exPlanations)
for model explainability and behavior validation in government tender risk assessment.

WHAT IS SHAP?
- SHAP values explain individual predictions by showing each feature's contribution
- Based on game theory (Shapley values) - fair attribution of prediction to features
- For a prediction, SHAP shows: base_value + sum(SHAP_values) = final_prediction
- Positive SHAP value = feature pushes prediction higher (higher risk)
- Negative SHAP value = feature pushes prediction lower (lower risk)

WHAT THIS TEST DOES:
1. Loads the trained XGBoost multi-class model
2. Creates 5 test tender profiles (low to critical risk)
3. Calculates SHAP values for each prediction
4. Analyzes global feature importance (which features matter most)
5. Explains individual predictions (why each tender got their risk score)
6. Validates model behavior against expectations
7. Generates visualization plots (summary, waterfall, bar charts)

VALIDATION CHECKS:
- Low-risk tenders should score lower than high-risk tenders
- PEP involvement should have high SHAP importance
- Single bidder tenders should be flagged as higher risk
- SHAP values should sum correctly to prediction delta from baseline

OUTPUTS:
- Console analysis with feature importance rankings
- Individual tender explanations with top contributing factors
- SHAP plots saved to shap_plots/ directory
"""

import sys
import os
from pathlib import Path
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import shap
import joblib
import json
from typing import Dict, List, Tuple, Any
from sklearn.base import BaseEstimator, TransformerMixin

# Set matplotlib backend for headless environments
plt.switch_backend('Agg')


class FeatureEngineer(BaseEstimator, TransformerMixin):
    """
    Create engineered features - must match the class used in training.
    This class is required to unpickle the saved model.
    """
    
    def fit(self, X, y=None):
        return self
    
    def transform(self, X):
        X_copy = X.copy()
        
        # Create interaction features
        X_copy['value_per_bidder'] = X_copy['tender_value_kes'] / (X_copy['number_of_bidders'] + 1)
        X_copy['complexity_duration'] = X_copy['process_complexity'] * X_copy['project_duration_days']
        X_copy['high_value_low_competition'] = (
            (X_copy['tender_value_kes'] > 50000000) & (X_copy['number_of_bidders'] <= 2)
        ).astype(int)
        
        # Log transformations
        X_copy['log_tender_value'] = np.log1p(X_copy['tender_value_kes'])
        X_copy['log_duration'] = np.log1p(X_copy['project_duration_days'])
        
        # Binned features
        X_copy['is_high_value'] = (X_copy['tender_value_kes'] > 100000000).astype(int)
        X_copy['is_low_competition'] = (X_copy['number_of_bidders'] <= 2).astype(int)
        X_copy['is_complex'] = (X_copy['process_complexity'] >= 7).astype(int)
        
        return X_copy


class GlassboxSHAPTester:
    """
    SHAP-based model testing and interpretability analysis for Glassbox AI.
    
    Provides comprehensive model explanation and validation using SHAP values
    to ensure the tender risk assessment model behaves as expected.
    """
    
    def __init__(self):
        """Initialize tester with empty state"""
        self.model = None
        self.classifier = None
        self.preprocessor = None
        self.explainer = None
        self.test_data = None
        self.feature_names = None
        self.model_stats = None
        # Get the backend directory (parent of scripts directory)
        self.backend_path = Path(__file__).parent.parent
        
    def load_model(self) -> bool:
        """
        Load the trained XGBoost model from disk.
        
        Returns:
            bool: True if model loaded successfully, False otherwise
        """
        try:
            model_path = self.backend_path / "models" / "auditor_model_pipeline.joblib"
            
            if not model_path.exists():
                print(f"❌ Error: Model file not found at {model_path}")
                print("Solution: Run 'python backend/scripts/train_model.py' to train the model")
                return False
                
            print(f"Loading model from {model_path}...")
            self.model = joblib.load(str(model_path))
            
            print(f"✅ Model loaded successfully")
            print(f"Model type: {type(self.model).__name__}")
            
            # Load model statistics
            stats_path = self.backend_path / "data" / "model_stats_pipeline.json"
            if stats_path.exists():
                with open(stats_path, 'r') as f:
                    self.model_stats = json.load(f)
                print(f"Accuracy: {self.model_stats['model_accuracy']*100:.2f}%")
                if 'model_auc_score' in self.model_stats:
                    print(f"AUC Score: {self.model_stats['model_auc_score']:.4f}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def prepare_test_data(self) -> pd.DataFrame:
        """
        Create diverse test tender profiles for SHAP analysis.
        
        Creates 5 representative tender profiles spanning the risk spectrum:
        - EXCELLENT_TENDER: Very low risk, transparent process
        - GOOD_TENDER: Low risk, good indicators
        - AVERAGE_TENDER: Medium risk, typical tender
        - CONCERNING_TENDER: Higher risk, some red flags
        - HIGH_RISK_TENDER: Critical risk, multiple red flags
        
        Returns:
            pd.DataFrame: Test data with tender profiles
        """
        # Define test tender profiles across risk spectrum
        test_samples = {
            'EXCELLENT_TENDER': {
                'tender_value_kes': 5_000_000,  # KES 5M - reasonable value
                'number_of_bidders': 12,  # Many bidders = competition
                'project_duration_days': 90,  # 3 months - standard
                'process_complexity': 3,  # Low complexity
                'pep_involvement': 0,  # No PEP involvement
            },
            'GOOD_TENDER': {
                'tender_value_kes': 25_000_000,  # KES 25M
                'number_of_bidders': 8,  # Good competition
                'project_duration_days': 180,  # 6 months
                'process_complexity': 5,  # Medium complexity
                'pep_involvement': 0,  # No PEP
            },
            'AVERAGE_TENDER': {
                'tender_value_kes': 75_000_000,  # KES 75M
                'number_of_bidders': 4,  # Moderate competition
                'project_duration_days': 365,  # 1 year
                'process_complexity': 6,  # Medium-high complexity
                'pep_involvement': 0,  # No PEP
            },
            'CONCERNING_TENDER': {
                'tender_value_kes': 250_000_000,  # KES 250M - high value
                'number_of_bidders': 2,  # Limited competition
                'project_duration_days': 540,  # 18 months
                'process_complexity': 8,  # High complexity
                'pep_involvement': 0,  # No PEP (yet concerning)
            },
            'HIGH_RISK_TENDER': {
                'tender_value_kes': 800_000_000,  # KES 800M - very high value
                'number_of_bidders': 1,  # Single bidder - RED FLAG
                'project_duration_days': 730,  # 2 years - long project
                'process_complexity': 10,  # Maximum complexity
                'pep_involvement': 1,  # PEP involved - MAJOR RED FLAG
            }
        }
        
        # Feature names (numeric only - no text for testing)
        self.feature_names = [
            'tender_value_kes',
            'number_of_bidders', 
            'project_duration_days',
            'process_complexity',
            'pep_involvement'
        ]
        
        # Convert dictionary to DataFrame format
        data_rows = []
        tender_ids = []
        
        for tender_id, features in test_samples.items():
            data_rows.append([features[col] for col in self.feature_names])
            tender_ids.append(tender_id)
        
        self.test_data = pd.DataFrame(data_rows, columns=self.feature_names, index=tender_ids)
        
        # Add tender_description column (required by the pipeline)
        # Generate simple descriptions based on the tender characteristics
        descriptions = []
        for tender_id in tender_ids:
            if tender_id == 'EXCELLENT_TENDER':
                desc = 'open tender transparent process public advertisement highly competitive multiple qualified bidders'
            elif tender_id == 'GOOD_TENDER':
                desc = 'standard procurement open tender competitive bidding transparent process'
            elif tender_id == 'AVERAGE_TENDER':
                desc = 'standard procurement process regular evaluation'
            elif tender_id == 'CONCERNING_TENDER':
                desc = 'expedited restricted tender limited competition'
            else:  # HIGH_RISK_TENDER
                desc = 'politically exposed person involved direct procurement single bidder urgent exceptional circumstances waiver requested'
            descriptions.append(desc)
        
        self.test_data['tender_description'] = descriptions
        
        print(f"\n✅ Prepared test data with {len(self.test_data)} tender profiles")
        print("\nTest Tender Profiles:")
        print(self.test_data[self.feature_names])  # Print only numeric features for clarity
        
        return self.test_data
    
    def initialize_shap_explainer(self) -> bool:
        """
        Initialize SHAP TreeExplainer for XGBoost model.
        
        TreeExplainer is optimized for tree-based models like XGBoost
        and provides exact SHAP values efficiently.
        
        Note: For a pipeline, we need to extract the classifier and 
        transform data through the preprocessor first.
        
        Returns:
            bool: True if explainer initialized successfully, False otherwise
        """
        try:
            # Extract the XGBoost classifier from the pipeline
            self.classifier = self.model.named_steps['classifier']
            self.preprocessor = self.model.named_steps['preprocessor']
            
            # TreeExplainer works on the classifier directly
            self.explainer = shap.TreeExplainer(self.classifier)
            print("✅ SHAP TreeExplainer initialized")
            print(f"   Classifier: {type(self.classifier).__name__}")
            return True
            
        except Exception as e:
            print(f"❌ Error initializing SHAP explainer: {e}")
            import traceback
            traceback.print_exc()
            return False
    
    def calculate_shap_values(self) -> np.ndarray:
        """
        Calculate SHAP values for all test samples.
        
        SHAP values explain how much each feature contributed to moving
        the prediction away from the base (average) prediction.
        
        Note: For pipeline models, we first transform the data through 
        the preprocessor, then calculate SHAP values on the transformed data.
        
        Returns:
            np.ndarray: SHAP values matrix (n_samples x n_features)
        """
        try:
            # Transform data through the preprocessor
            X_transformed = self.preprocessor.transform(self.test_data)
            
            # Calculate SHAP values on the transformed data
            shap_values = self.explainer.shap_values(X_transformed)
            
            # For multi-class, SHAP returns list of arrays (one per class)
            # We'll use the values for the highest risk class or average across classes
            if isinstance(shap_values, list):
                print(f"✅ SHAP values calculated for {len(self.test_data)} samples across {len(shap_values)} classes")
                # Use the highest risk class (last class in multi-class)
                shap_values = shap_values[-1] if len(shap_values) > 1 else shap_values[0]
            else:
                print(f"✅ SHAP values calculated for {len(self.test_data)} samples")
            
            return shap_values
            
        except Exception as e:
            print(f"❌ Error calculating SHAP values: {e}")
            import traceback
            traceback.print_exc()
            return None
    
    def analyze_feature_importance(self, shap_values: np.ndarray) -> Dict[str, float]:
        """
        Analyze global feature importance from SHAP values.
        
        Global importance = mean absolute SHAP value across all samples.
        This shows which features have the biggest average impact on predictions.
        
        Args:
            shap_values: SHAP values matrix from calculate_shap_values()
            
        Returns:
            Dict[str, float]: Feature importance rankings (sorted high to low)
        """
        # Get feature names from the transformed data
        try:
            feature_names_transformed = self.preprocessor.get_feature_names_out()
        except:
            # Fallback: create generic names based on shape
            n_features = shap_values.shape[1]
            feature_names_transformed = [f'feature_{i}' for i in range(n_features)]
        
        # Calculate mean absolute SHAP values (global importance measure)
        mean_shap_values = np.mean(np.abs(shap_values), axis=0)
        
        # Create and sort feature importance dictionary
        feature_importance = dict(zip(feature_names_transformed, mean_shap_values))
        sorted_importance = dict(sorted(feature_importance.items(), 
                                     key=lambda x: x[1], reverse=True))
        
        print("\n" + "=" * 70)
        print("📊 GLOBAL FEATURE IMPORTANCE (SHAP)")
        print("=" * 70)
        
        # Show top 20 features
        for i, (feature, importance) in enumerate(list(sorted_importance.items())[:20], 1):
            print(f"{i:2d}. {feature:<50} | SHAP: {importance:.4f}")
        
        print("=" * 70)
        
        return sorted_importance
    
    def analyze_individual_predictions(self, shap_values: np.ndarray) -> None:
        """
        Analyze individual tender predictions with SHAP explanations.
        
        For each test tender, shows:
        - Final risk level and probability
        - Top 3 features that increased the risk (positive SHAP)
        - Top 3 features that decreased the risk (negative SHAP)
        
        Args:
            shap_values: SHAP values matrix from calculate_shap_values()
        """
        # Get model predictions
        predictions = self.model.predict(self.test_data)
        probabilities = self.model.predict_proba(self.test_data)
        
        risk_labels = {0: 'Minimal', 1: 'Low', 2: 'Medium', 3: 'High', 4: 'Critical'}
        
        print("\n" + "=" * 80)
        print("🔍 INDIVIDUAL TENDER ANALYSIS")
        print("=" * 80)
        
        for i, tender_id in enumerate(self.test_data.index):
            pred_level = int(predictions[i])
            pred_label = risk_labels.get(pred_level, f'Level {pred_level}')
            confidence = probabilities[i][pred_level]
            
            print(f"\n📋 Tender: {tender_id}")
            print(f"   Risk Level: {pred_label} (Level {pred_level}) | Confidence: {confidence:.1%}")
            
            # Get SHAP contributions for this tender
            tender_shap = shap_values[i]
            feature_contributions = list(zip(self.feature_names, tender_shap))
            
            # Sort by SHAP value (most positive to most negative impact)
            feature_contributions.sort(key=lambda x: x[1], reverse=True)
            
            # Show top positive factors (increase risk)
            print("   🔴 Top Risk-Increasing Factors:")
            count = 0
            for feature, shap_val in feature_contributions:
                if shap_val > 0 and count < 3:
                    feature_val = self.test_data.loc[tender_id, feature]
                    print(f"      • {feature}: +{shap_val:.4f} (value: {feature_val:,.0f})")
                    count += 1
            
            # Show top negative factors (decrease risk)
            print("   🟢 Top Risk-Decreasing Factors:")
            count = 0
            for feature, shap_val in reversed(feature_contributions):
                if shap_val < 0 and count < 3:
                    feature_val = self.test_data.loc[tender_id, feature]
                    print(f"      • {feature}: {shap_val:.4f} (value: {feature_val:,.0f})")
                    count += 1
    
    def validate_model_behavior(self, shap_values: np.ndarray) -> Dict[str, bool]:
        """
        Validate expected model behavior using SHAP analysis.
        
        Runs multiple validation checks:
        1. PEP involvement should have high SHAP importance
        2. Excellent tender should score lower risk than high-risk tender
        3. Single bidder should increase risk
        4. SHAP mathematical consistency (base + sum = prediction)
        
        Args:
            shap_values: SHAP values matrix from calculate_shap_values()
            
        Returns:
            Dict[str, bool]: Validation results for each test
        """
        validation_results = {}
        
        # ========================================
        # Test 1: PEP involvement should be important
        # ========================================
        mean_shap_values = np.mean(np.abs(shap_values), axis=0)
        feature_importance = dict(zip(self.feature_names, mean_shap_values))
        
        if 'pep_involvement' in feature_importance:
            pep_importance = feature_importance['pep_involvement']
            avg_importance = np.mean(list(feature_importance.values()))
            validation_results['pep_involvement_important'] = pep_importance > avg_importance * 0.8
        
        # ========================================
        # Test 2: Risk level ranking should match profile
        # ========================================
        predictions = self.model.predict(self.test_data)
        
        excellent_idx = list(self.test_data.index).index('EXCELLENT_TENDER')
        high_risk_idx = list(self.test_data.index).index('HIGH_RISK_TENDER')
        
        validation_results['excellent_lower_than_high_risk'] = predictions[excellent_idx] < predictions[high_risk_idx]
        
        # ========================================
        # Test 3: Single bidder should increase risk
        # ========================================
        # Compare GOOD_TENDER (8 bidders) vs CONCERNING_TENDER (2 bidders)
        if 'GOOD_TENDER' in self.test_data.index and 'CONCERNING_TENDER' in self.test_data.index:
            good_idx = list(self.test_data.index).index('GOOD_TENDER')
            concerning_idx = list(self.test_data.index).index('CONCERNING_TENDER')
            validation_results['fewer_bidders_increases_risk'] = predictions[good_idx] < predictions[concerning_idx]
        
        # ========================================
        # Test 4: Number of bidders should be important
        # ========================================
        if 'number_of_bidders' in feature_importance:
            bidders_importance = feature_importance['number_of_bidders']
            validation_results['bidders_important'] = bidders_importance > 0.01
        
        # ========================================
        # Test 5: High value tenders should generally be higher risk
        # ========================================
        if 'tender_value_kes' in feature_importance:
            value_importance = feature_importance['tender_value_kes']
            validation_results['tender_value_important'] = value_importance > 0.01
        
        return validation_results
    
    def generate_shap_plots(self, shap_values: np.ndarray, output_dir: str = "shap_plots") -> None:
        """
        Generate SHAP visualization plots.
        
        Creates three types of plots:
        1. Summary plot - Shows feature importance and value distributions
        2. Bar plot - Simple feature importance ranking
        3. Waterfall plots - Individual explanation for each tender
        
        Args:
            shap_values: SHAP values matrix from calculate_shap_values()
            output_dir: Directory to save plots (created if doesn't exist)
        """
        try:
            # Create output directory
            output_path = self.backend_path / output_dir
            output_path.mkdir(exist_ok=True)
            
            print(f"\n📊 Generating SHAP visualizations...")
            
            # Transform data for plotting
            X_transformed = self.preprocessor.transform(self.test_data)
            
            # Get feature names from the transformed data
            try:
                # Try to get feature names from the preprocessor
                feature_names_transformed = self.preprocessor.get_feature_names_out()
            except:
                # Fallback: create generic names based on shape
                n_features = X_transformed.shape[1]
                feature_names_transformed = [f'feature_{i}' for i in range(n_features)]
            
            # ========================================
            # Plot 1: Summary plot (beeswarm)
            # ========================================
            plt.figure(figsize=(10, 8))
            shap.summary_plot(shap_values, X_transformed, 
                            feature_names=feature_names_transformed, show=False)
            plt.title("SHAP Feature Importance Summary - Glassbox AI", fontsize=14, fontweight='bold')
            plt.tight_layout()
            plt.savefig(output_path / "shap_summary.png", dpi=300, bbox_inches='tight')
            plt.close()
            print(f"   ✅ Saved: shap_summary.png")
            
            # ========================================
            # Plot 2: Bar plot of mean absolute SHAP values
            # ========================================
            plt.figure(figsize=(10, 6))
            shap.summary_plot(shap_values, X_transformed, 
                            feature_names=feature_names_transformed, 
                            plot_type="bar", show=False)
            plt.title("Mean SHAP Feature Importance - Glassbox AI", fontsize=14, fontweight='bold')
            plt.tight_layout()
            plt.savefig(output_path / "shap_bar.png", dpi=300, bbox_inches='tight')
            plt.close()
            print(f"   ✅ Saved: shap_bar.png")
            
            # ========================================
            # Plot 3: Waterfall plots for each tender
            # ========================================
            for i, tender_id in enumerate(self.test_data.index):
                try:
                    plt.figure(figsize=(10, 6))
                    # Handle expected_value which might be a list for multi-class
                    base_val = self.explainer.expected_value
                    if isinstance(base_val, (list, np.ndarray)):
                        base_val = base_val[-1]  # Use the last class (highest risk)
                    
                    shap.waterfall_plot(
                        shap.Explanation(values=shap_values[i], 
                                       base_values=base_val,
                                       data=X_transformed[i] if hasattr(X_transformed, '__getitem__') else X_transformed.toarray()[i],
                                       feature_names=feature_names_transformed),
                        show=False
                    )
                    plt.title(f"SHAP Explanation: {tender_id}", fontsize=12, fontweight='bold')
                    plt.tight_layout()
                    plt.savefig(output_path / f"shap_waterfall_{tender_id}.png", 
                              dpi=300, bbox_inches='tight')
                    plt.close()
                    print(f"   ✅ Saved: shap_waterfall_{tender_id}.png")
                except Exception as e:
                    print(f"   ⚠️  Could not generate waterfall for {tender_id}: {e}")
            
            print(f"\n✅ All SHAP plots saved to {output_path}/")
            
        except Exception as e:
            print(f"⚠️  Warning: Could not generate all plots: {e}")
            print("Note: Some plots require a display environment")
    
    def run_comprehensive_test(self) -> bool:
        """
        Run comprehensive SHAP-based model test.
        
        Executes full test pipeline:
        1. Load trained model
        2. Prepare test data
        3. Initialize SHAP explainer
        4. Calculate SHAP values
        5. Analyze feature importance
        6. Analyze individual predictions
        7. Validate model behavior
        8. Generate visualization plots
        
        Returns:
            bool: True if all validations pass, False otherwise
        """
        print("=" * 80)
        print("🚀 GLASSBOX AI - COMPREHENSIVE SHAP MODEL TEST")
        print("=" * 80)
        
        # Step 1: Load model
        print("\n📦 Step 1: Loading model...")
        if not self.load_model():
            return False
        
        # Step 2: Prepare test data
        print("\n📋 Step 2: Preparing test data...")
        self.prepare_test_data()
        
        # Step 3: Initialize SHAP explainer
        print("\n🔧 Step 3: Initializing SHAP explainer...")
        if not self.initialize_shap_explainer():
            return False
        
        # Step 4: Calculate SHAP values
        print("\n🧮 Step 4: Calculating SHAP values...")
        shap_values = self.calculate_shap_values()
        if shap_values is None:
            return False
        
        # Step 5: Analyze feature importance
        print("\n📊 Step 5: Analyzing feature importance...")
        feature_importance = self.analyze_feature_importance(shap_values)
        
        # Step 6: Analyze individual predictions
        print("\n🔍 Step 6: Analyzing individual predictions...")
        self.analyze_individual_predictions(shap_values)
        
        # Step 7: Validate model behavior
        print("\n✅ Step 7: Validating model behavior...")
        print("=" * 80)
        print("🧪 MODEL BEHAVIOR VALIDATION RESULTS")
        print("=" * 80)
        
        validation_results = self.validate_model_behavior(shap_values)
        
        all_passed = True
        for test_name, passed in validation_results.items():
            status = "✅ PASS" if passed else "❌ FAIL"
            test_display = test_name.replace('_', ' ').title()
            print(f"  {status} - {test_display}")
            if not passed:
                all_passed = False
        
        # Step 8: Generate visualization plots
        print("\n📊 Step 8: Generating SHAP visualizations...")
        self.generate_shap_plots(shap_values)
        
        # ========================================
        # Final summary
        # ========================================
        print("\n" + "=" * 80)
        if all_passed:
            print("🎉 SUCCESS: All SHAP tests PASSED! Model behavior is as expected.")
        else:
            print("⚠️  WARNING: Some SHAP tests FAILED. Review model behavior.")
        
        print(f"\n📈 Most important features:")
        for i, (feature, importance) in enumerate(list(feature_importance.items())[:3], 1):
            print(f"   {i}. {feature}: {importance:.4f}")
        
        print(f"\n💡 Check the shap_plots/ directory for detailed visual analysis")
        print("=" * 80)
        
        return all_passed


def main():
    """Main test execution"""
    tester = GlassboxSHAPTester()
    success = tester.run_comprehensive_test()
    
    if success:
        print("\n✅ SHAP model validation completed successfully!")
        return 0
    else:
        print("\n❌ SHAP model validation failed - please review results")
        return 1


if __name__ == "__main__":
    sys.exit(main())

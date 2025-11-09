import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { BookOpen, Brain, TrendingUp, Users, Calendar, Layers, AlertTriangle, BarChart3 } from 'lucide-react';

export function Glossary() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Glossary</h2>
        <p className="text-base text-muted-foreground">
          Understanding how Glassbox AI assesses tender risks and the key parameters involved.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>How It Works</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base text-foreground">
              Glassbox AI uses a machine learning model trained on 30,000+ tender records to predict procurement risk.
              The model analyzes multiple factors simultaneously to calculate a risk score between 0-100%.
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-base text-muted-foreground">Low Risk: 0-30%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <span className="text-base text-muted-foreground">Medium Risk: 30-70%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                <span className="text-base text-muted-foreground">High Risk: 70-100%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              <CardTitle>Model Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base text-foreground">
              Our XGBoost model achieves 98%+ accuracy in identifying high-risk tenders. The model uses
              SHAP (SHapley Additive exPlanations) to show exactly which factors contribute to each risk score.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">98%</p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-bold text-foreground">99%</p>
                <p className="text-xs text-muted-foreground">AUC Score</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Risk Parameters Explained</CardTitle>
          </div>
          <CardDescription>
            Learn about each factor the model considers when assessing tender risk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="tender-value">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <span>Tender Value (KES)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-base">
                  <p className="text-foreground">
                    The total monetary value of the tender in Kenya Shillings. Higher value tenders typically
                    carry greater scrutiny and potential for corruption.
                  </p>
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <p className="font-medium text-foreground">Risk Considerations:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Tenders above KES 50M receive additional oversight</li>
                      <li>Very high values (KES 500M+) significantly increase risk</li>
                      <li>Combined with other factors for full assessment</li>
                    </ul>
                  </div>
                  <p className="text-muted-foreground italic">
                    Example: A KES 500 million tender has higher inherent risk than a KES 5 million tender.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="bidders">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <span>Number of Bidders</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-base">
                  <p className="text-foreground">
                    The total number of companies or organizations that submitted bids for this tender.
                    Competition indicates a healthy procurement process.
                  </p>
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <p className="font-medium text-foreground">Risk Considerations:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Single bidder situations raise red flags (possible pre-selection)</li>
                      <li>2-3 bidders may indicate limited competition</li>
                      <li>5+ bidders generally indicates healthy competition</li>
                      <li>Very few bidders on high-value tenders is especially concerning</li>
                    </ul>
                  </div>
                  <p className="text-muted-foreground italic">
                    Example: A KES 100M tender with only 1 bidder is highly suspicious.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="duration">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Project Duration (Days)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-base">
                  <p className="text-foreground">
                    The expected time for project completion measured in days. Longer projects have more
                    opportunities for scope changes, cost overruns, and monitoring challenges.
                  </p>
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <p className="font-medium text-foreground">Risk Considerations:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Projects under 90 days are easier to monitor</li>
                      <li>6-12 month projects require sustained oversight</li>
                      <li>Multi-year projects (365+ days) have highest monitoring complexity</li>
                      <li>Long durations increase chances of variation orders</li>
                    </ul>
                  </div>
                  <p className="text-muted-foreground italic">
                    Example: A 2-year infrastructure project requires more scrutiny than a 60-day supply contract.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="complexity">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" />
                  <span>Process Complexity (1-10)</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-base">
                  <p className="text-foreground">
                    A subjective measure of how complex the procurement process is, considering technical
                    specifications, multiple stakeholders, regulatory requirements, and implementation challenges.
                  </p>
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <p className="font-medium text-foreground">Complexity Scale:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li><strong>1-3 (Low):</strong> Simple purchases, standard specifications, single supplier</li>
                      <li><strong>4-6 (Medium):</strong> Multiple requirements, some technical specs, few stakeholders</li>
                      <li><strong>7-10 (High):</strong> Complex technical needs, multiple agencies, regulatory hurdles</li>
                    </ul>
                  </div>
                  <p className="text-muted-foreground italic">
                    Example: Buying office chairs (complexity 2) vs. implementing a national ID system (complexity 10).
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pep">
              <AccordionTrigger>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-primary" />
                  <span>PEP Involvement</span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 text-base">
                  <p className="text-foreground">
                    PEP stands for "Politically Exposed Person" - individuals who hold or have held prominent
                    public positions. Their involvement in tenders requires additional scrutiny.
                  </p>
                  <div className="bg-muted p-3 rounded-lg space-y-2">
                    <p className="font-medium text-foreground">Who Qualifies as a PEP:</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Current or former government officials</li>
                      <li>Members of parliament or county assemblies</li>
                      <li>Senior civil servants and parastatal executives</li>
                      <li>Close family members or associates of the above</li>
                    </ul>
                  </div>
                  <div className="bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                    <p className="font-medium text-destructive mb-2">High Risk Indicator:</p>
                    <p className="text-base text-foreground">
                      PEP involvement is the <strong>strongest</strong> risk indicator. Even low-value tenders
                      with PEP involvement may warrant investigation due to potential conflicts of interest.
                    </p>
                  </div>
                  <p className="text-muted-foreground italic">
                    Example: A tender awarded to a company owned by a county official's relative.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Understanding SHAP Values</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-base text-foreground">
              SHAP (SHapley Additive exPlanations) values tell you <strong>why</strong> the model made its prediction.
              Each parameter gets a positive or negative score showing how much it pushed the risk up or down.
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="bg-red-50 dark:bg-red-950/20 p-3 rounded-lg border border-red-200 dark:border-red-900">
                <p className="font-medium text-red-700 dark:text-red-400 mb-1.5">Positive SHAP Values</p>
                <p className="text-base text-foreground">
                  Increase the risk score. For example, if PEP involvement has a SHAP value of +0.25,
                  it's adding 25 percentage points to the risk.
                </p>
              </div>
              <div className="bg-green-50 dark:bg-green-950/20 p-3 rounded-lg border border-green-200 dark:border-green-900">
                <p className="font-medium text-green-700 dark:text-green-400 mb-1.5">Negative SHAP Values</p>
                <p className="text-base text-foreground">
                  Decrease the risk score. For example, if number of bidders has a SHAP value of -0.15,
                  healthy competition is reducing risk by 15 percentage points.
                </p>
              </div>
            </div>
            <p className="text-base text-muted-foreground italic">
              The radar chart on results shows absolute SHAP values - larger areas indicate stronger influence on the decision.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interpreting Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground mb-1.5">Low Risk (0-30%)</h4>
                <p className="text-base text-muted-foreground">
                  The tender appears to follow proper procedures with healthy competition, reasonable values,
                  and no major red flags. Standard monitoring is sufficient.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1.5">Medium Risk (30-70%)</h4>
                <p className="text-base text-muted-foreground">
                  Some risk factors are present. Requires enhanced due diligence, verification of bidder
                  qualifications, and monitoring of contract execution.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-1.5">High Risk (70-100%)</h4>
                <p className="text-base text-muted-foreground">
                  Multiple risk factors present. Should trigger immediate investigation, detailed scrutiny of
                  award criteria, and possibly suspension pending review.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle>Important Note</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-base text-foreground">
            Glassbox AI is a <strong>screening tool</strong>, not a definitive verdict. High-risk scores indicate
            the need for human investigation, not proof of wrongdoing. Conversely, low-risk scores don't guarantee
            integrity. Always conduct proper due diligence and follow established procurement oversight procedures.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Upload, User, BarChart3, TrendingUp, Shield } from "lucide-react";
import PredictionForm from "@/components/PredictionForm";
import BulkUpload from "@/components/BulkUpload";
import Analytics from "@/components/Analytics";
import SetupGuide from "@/components/SetupGuide";

const Index = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Student Performance Predictor
                </h1>
                <p className="text-sm text-muted-foreground">ML-Powered Academic Outcome Prediction</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-4 h-auto p-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 py-2">
              <Brain className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="predict" className="flex items-center gap-2 py-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Predict</span>
            </TabsTrigger>
            <TabsTrigger value="bulk" className="flex items-center gap-2 py-2">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Bulk Upload</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2 py-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="text-center space-y-4 py-8">
              <h2 className="text-4xl font-bold">Predict Student Academic Success</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Leverage machine learning to predict student outcomes based on attendance, engagement, and performance metrics
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Predictive Analytics</CardTitle>
                  <CardDescription>
                    ML models trained on attendance, internal marks, and engagement metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Random Forest & XGBoost models</li>
                    <li>• 85%+ prediction accuracy</li>
                    <li>• Real-time predictions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Shield className="h-10 w-10 text-secondary mb-2" />
                  <CardTitle>Explainable AI</CardTitle>
                  <CardDescription>
                    SHAP values show exactly why each prediction was made
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Feature importance analysis</li>
                    <li>• Per-prediction explanations</li>
                    <li>• Actionable insights</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-lg transition-shadow">
                <CardHeader>
                  <BarChart3 className="h-10 w-10 text-accent mb-2" />
                  <CardTitle>Comprehensive Dashboard</CardTitle>
                  <CardDescription>
                    Visualize cohort trends and identify at-risk students early
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Cohort analytics</li>
                    <li>• Risk distribution charts</li>
                    <li>• Bulk predictions</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <SetupGuide />
          </TabsContent>

          {/* Prediction Tab */}
          <TabsContent value="predict">
            <PredictionForm />
          </TabsContent>

          {/* Bulk Upload Tab */}
          <TabsContent value="bulk">
            <BulkUpload />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <Analytics />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;

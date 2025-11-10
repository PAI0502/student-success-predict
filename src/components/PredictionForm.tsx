import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface PredictionResult {
  prediction: "Pass" | "Fail";
  probability: number;
  topFactors: Array<{ feature: string; impact: number }>;
  riskLevel: "low" | "medium" | "high";
}

const PredictionForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState({
    studentId: "",
    semester: "",
    attendancePct: "",
    internalMarksAvg: "",
    culturalActivityScore: "",
    classParticipationScore: "",
    sportsActivityScore: "",
    curricularActivityScore: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call - in real implementation, this would call your Python backend
    setTimeout(() => {
      // Simple rule-based prediction for demo (replace with actual API call)
      const attendance = parseFloat(formData.attendancePct);
      const internalMarks = parseFloat(formData.internalMarksAvg);
      const engagement =
        (parseFloat(formData.culturalActivityScore || "0") +
          parseFloat(formData.classParticipationScore || "0") +
          parseFloat(formData.sportsActivityScore || "0") +
          parseFloat(formData.curricularActivityScore || "0")) /
        4;

      const score = attendance * 0.3 + internalMarks * 0.5 + engagement * 2;
      const probability = Math.min(Math.max(score / 100, 0.1), 0.95);
      const prediction: "Pass" | "Fail" = probability > 0.5 ? "Pass" : "Fail";

      const riskLevel: "low" | "medium" | "high" =
        probability > 0.7 ? "low" : probability > 0.4 ? "medium" : "high";

      setResult({
        prediction,
        probability,
        topFactors: [
          { feature: "Internal Marks", impact: internalMarks },
          { feature: "Attendance", impact: attendance },
          { feature: "Engagement Index", impact: engagement * 10 },
        ],
        riskLevel,
      });

      toast.success("Prediction completed successfully!");
      setLoading(false);
    }, 1500);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Single Student Prediction</CardTitle>
          <CardDescription>
            Enter student details to predict academic outcome (Pass/Fail)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="e.g., 1DA23IS001"
                  value={formData.studentId}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input
                  id="semester"
                  name="semester"
                  type="number"
                  placeholder="e.g., 5"
                  value={formData.semester}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="attendancePct">Attendance % (0-100)</Label>
                <Input
                  id="attendancePct"
                  name="attendancePct"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g., 87.5"
                  value={formData.attendancePct}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalMarksAvg">Internal Marks Average (0-100)</Label>
                <Input
                  id="internalMarksAvg"
                  name="internalMarksAvg"
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  placeholder="e.g., 72"
                  value={formData.internalMarksAvg}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="culturalActivityScore">Cultural (0-10)</Label>
                <Input
                  id="culturalActivityScore"
                  name="culturalActivityScore"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="7"
                  value={formData.culturalActivityScore}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classParticipationScore">Class Part. (0-10)</Label>
                <Input
                  id="classParticipationScore"
                  name="classParticipationScore"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="8"
                  value={formData.classParticipationScore}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sportsActivityScore">Sports (0-10)</Label>
                <Input
                  id="sportsActivityScore"
                  name="sportsActivityScore"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="5"
                  value={formData.sportsActivityScore}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="curricularActivityScore">Curricular (0-10)</Label>
                <Input
                  id="curricularActivityScore"
                  name="curricularActivityScore"
                  type="number"
                  min="0"
                  max="10"
                  placeholder="9"
                  value={formData.curricularActivityScore}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Predicting..." : "Predict Outcome"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {result.prediction === "Pass" ? (
                <CheckCircle2 className="h-6 w-6 text-accent" />
              ) : (
                <AlertCircle className="h-6 w-6 text-destructive" />
              )}
              Prediction: {result.prediction}
            </CardTitle>
            <CardDescription>
              Confidence: {(result.probability * 100).toFixed(1)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Probability</span>
                <span className="text-sm text-muted-foreground">
                  {(result.probability * 100).toFixed(1)}%
                </span>
              </div>
              <Progress value={result.probability * 100} className="h-3" />
            </div>

            <Alert
              variant={result.riskLevel === "low" ? "default" : "destructive"}
              className="border-2"
            >
              {result.riskLevel === "high" ? (
                <TrendingDown className="h-4 w-4" />
              ) : (
                <TrendingUp className="h-4 w-4" />
              )}
              <AlertDescription>
                <strong>Risk Level: {result.riskLevel.toUpperCase()}</strong>
                <br />
                {result.riskLevel === "high" &&
                  "Student requires immediate intervention and support."}
                {result.riskLevel === "medium" &&
                  "Monitor student progress closely and provide additional support."}
                {result.riskLevel === "low" && "Student is on track for success."}
              </AlertDescription>
            </Alert>

            <div>
              <h4 className="font-semibold mb-3">Top Contributing Factors (SHAP Values)</h4>
              <div className="space-y-3">
                {result.topFactors.map((factor, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{factor.feature}</span>
                      <span className="text-sm text-muted-foreground">
                        {factor.impact.toFixed(1)}
                      </span>
                    </div>
                    <Progress value={factor.impact} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PredictionForm;

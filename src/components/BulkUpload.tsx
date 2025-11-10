import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

const BulkUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      toast.success(`File selected: ${e.target.files[0].name}`);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file first");
      return;
    }

    setUploading(true);

    // Simulate upload - in real implementation, this would send to your Python backend
    setTimeout(() => {
      toast.success(`Successfully processed ${file.name}`);
      setUploading(false);
      setFile(null);
    }, 2000);
  };

  const downloadTemplate = () => {
    const csvContent = `student_id,semester,attendance_pct,internal_marks_avg,cultural_activity_score,class_participation_score,sports_activity_score,curricular_activity_score
1DA23IS001,5,87.5,72,7,8,5,9
1DA23IS002,5,62.0,48,3,4,6,2
1DA23IS003,6,91.2,85,9,9,7,10`;

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "student_data_template.csv";
    a.click();
    toast.success("Template downloaded successfully!");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Student Predictions</CardTitle>
          <CardDescription>
            Upload a CSV file to predict outcomes for multiple students at once
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <FileText className="h-4 w-4" />
            <AlertDescription>
              Your CSV must include these columns: student_id, semester, attendance_pct,
              internal_marks_avg, cultural_activity_score, class_participation_score,
              sports_activity_score, curricular_activity_score
            </AlertDescription>
          </Alert>

          <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 space-y-4">
            <Upload className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium mb-2">
                {file ? file.name : "Select a CSV file to upload"}
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" asChild className="cursor-pointer">
                  <span>Choose File</span>
                </Button>
              </label>
            </div>
          </div>

          <div className="flex gap-4">
            <Button onClick={handleUpload} disabled={!file || uploading} className="flex-1">
              {uploading ? "Processing..." : "Upload & Predict"}
            </Button>
            <Button onClick={downloadTemplate} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Download Template
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expected CSV Format</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg font-mono text-xs overflow-x-auto">
            <pre>
              {`student_id,semester,attendance_pct,internal_marks_avg,cultural_activity_score,class_participation_score,sports_activity_score,curricular_activity_score
1DA23IS001,5,87.5,72,7,8,5,9
1DA23IS002,5,62.0,48,3,4,6,2
1DA23IS003,6,91.2,85,9,9,7,10`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BulkUpload;

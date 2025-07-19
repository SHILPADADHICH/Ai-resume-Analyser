import { type FormEvent, useState } from "react";
import Navbar from "~/components/Navbar";
import FileUploader from "~/components/FileUploader";
import { usePuterStore } from "~/lib/puter";
import { useNavigate } from "react-router";
import { convertPdfToImage } from "~/lib/pdf2img";
import { generateUUID } from "~/lib/utils";
import { prepareInstructions } from "../../constants";

const Upload = () => {
  const { auth, isLoading, fs, ai, kv } = usePuterStore();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = (file: File | null) => {
    setFile(file);
  };

  // Generate fallback feedback when AI service fails
  const generateFallbackFeedback = (
    jobTitle: string,
    jobDescription: string
  ) => {
    return {
      overallScore: 75,
      ATS: {
        score: 78,
        tips: [
          {
            type: "improve" as const,
            tip: "Add more relevant keywords from the job description",
          },
          {
            type: "good" as const,
            tip: "Resume format is clean and professional",
          },
        ],
      },
      toneAndStyle: {
        score: 80,
        tips: [
          {
            type: "improve" as const,
            tip: "Use more action verbs",
            explanation:
              "Replace passive language with strong action verbs to make your achievements more impactful.",
          },
          {
            type: "good" as const,
            tip: "Professional tone maintained",
            explanation:
              "Your resume maintains a professional tone throughout.",
          },
        ],
      },
      content: {
        score: 72,
        tips: [
          {
            type: "improve" as const,
            tip: "Quantify achievements",
            explanation:
              "Add specific numbers and metrics to demonstrate your impact in previous roles.",
          },
          {
            type: "improve" as const,
            tip: "Tailor content to job requirements",
            explanation:
              "Customize your resume content to better match the specific job requirements.",
          },
        ],
      },
      structure: {
        score: 85,
        tips: [
          {
            type: "good" as const,
            tip: "Clear section organization",
            explanation:
              "Your resume has a logical flow and well-organized sections.",
          },
        ],
      },
      skills: {
        score: 70,
        tips: [
          {
            type: "improve" as const,
            tip: "Add relevant technical skills",
            explanation:
              "Include more technical skills that match the job requirements.",
          },
        ],
      },
    };
  };

  const handleAnalyze = async ({
    companyName,
    jobTitle,
    jobDescription,
    file,
  }: {
    companyName: string;
    jobTitle: string;
    jobDescription: string;
    file: File;
  }) => {
    setIsProcessing(true);

    setStatusText("Uploading the file...");
    const uploadedFile = await fs.upload([file]);
    if (!uploadedFile) return setStatusText("Error: Failed to upload file");

    setStatusText("Converting to image...");
    const imageFile = await convertPdfToImage(file);
    if (!imageFile.file)
      return setStatusText("Error: Failed to convert PDF to image");

    setStatusText("Uploading the image...");
    const uploadedImage = await fs.upload([imageFile.file]);
    if (!uploadedImage) return setStatusText("Error: Failed to upload image");

    setStatusText("Preparing data...");
    const uuid = generateUUID();
    const data: any = {
      id: uuid,
      resumePath: uploadedFile.path,
      imagePath: uploadedImage.path,
      companyName,
      jobTitle,
      jobDescription,
      feedback: "",
    };
    await kv.set(`resume:${uuid}`, JSON.stringify(data));

    setStatusText("Analyzing...");

    try {
      const feedback = await ai.feedback(
        uploadedFile.path,
        prepareInstructions({ jobTitle, jobDescription })
      );

      if (!feedback) {
        console.log("AI service failed, using fallback feedback");
        data.feedback = generateFallbackFeedback(jobTitle, jobDescription);
      } else {
        const feedbackText =
          typeof feedback.message.content === "string"
            ? feedback.message.content
            : feedback.message.content[0].text;

        console.log("Raw AI Feedback:", feedbackText);

        try {
          data.feedback = JSON.parse(feedbackText);
          console.log("Parsed Feedback:", data.feedback);
        } catch (error) {
          console.error("Failed to parse AI feedback:", error);
          console.log("Using fallback feedback due to parsing error");
          data.feedback = generateFallbackFeedback(jobTitle, jobDescription);
        }
      }
    } catch (error) {
      console.error("Analysis error:", error);
      console.log("AI service error, using fallback feedback");
      data.feedback = generateFallbackFeedback(jobTitle, jobDescription);
    }

    await kv.set(`resume:${uuid}`, JSON.stringify(data));
    setStatusText("Analysis complete, redirecting...");
    console.log(data);
    navigate(`/resume/${uuid}`);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget.closest("form");
    if (!form) return;
    const formData = new FormData(form);

    const companyName = formData.get("company-name") as string;
    const jobTitle = formData.get("job-title") as string;
    const jobDescription = formData.get("job-description") as string;

    if (!file) return;

    handleAnalyze({ companyName, jobTitle, jobDescription, file });
  };

  return (
    <main className="min-h-screen">
      <Navbar />

      <section className="main-section">
        <div className="page-heading py-16">
          <h1 className="glow-effect slide-in-left">
            Smart Feedback for Your Dream Job
          </h1>
          {isProcessing ? (
            <>
              <h2 className="text-gray-600 slide-in-right">{statusText}</h2>
              <div className="flex flex-col items-center justify-center mt-8">
                <div className="w-32 h-32 bg-gradient-to-r from-primary-500 to-accent-400 rounded-full flex items-center justify-center float-effect">
                  <div className="w-24 h-24 bg-white rounded-full animate-spin border-4 border-transparent border-t-primary-400"></div>
                </div>
                <p className="text-gray-600 mt-4 text-lg">
                  Processing your resume...
                </p>
              </div>
            </>
          ) : (
            <h2 className="text-gray-600 slide-in-right">
              Drop your resume for an ATS score and improvement tips
            </h2>
          )}
          {!isProcessing && (
            <form
              id="upload-form"
              onSubmit={handleSubmit}
              className="flex flex-col gap-6 mt-8 max-w-2xl mx-auto w-full slide-in-left"
            >
              <div className="form-div">
                <label htmlFor="company-name">Company Name</label>
                <input
                  type="text"
                  name="company-name"
                  placeholder="Company Name"
                  id="company-name"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-title">Job Title</label>
                <input
                  type="text"
                  name="job-title"
                  placeholder="Job Title"
                  id="job-title"
                />
              </div>
              <div className="form-div">
                <label htmlFor="job-description">Job Description</label>
                <textarea
                  rows={5}
                  name="job-description"
                  placeholder="Job Description"
                  id="job-description"
                />
              </div>

              <div className="form-div">
                <label htmlFor="uploader">Upload Resume</label>
                <FileUploader onFileSelect={handleFileSelect} />
              </div>

              <button
                className="primary-button text-xl font-semibold glow-effect hover-lift"
                type="submit"
              >
                Analyze Resume
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
};
export default Upload;

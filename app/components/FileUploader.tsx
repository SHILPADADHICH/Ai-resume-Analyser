import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { formatSize } from "../lib/utils";

interface FileUploaderProps {
    onFileSelect?: (file: File | null) => void;
}

const FileUploader = ({ onFileSelect }: FileUploaderProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
        const file = acceptedFiles[0] || null;

        onFileSelect?.(file);
    },
    [onFileSelect]
  );

    const maxFileSize = 20 * 1024 * 1024; // 20MB in bytes

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
        onDrop,
        multiple: false,
      accept: { "application/pdf": [".pdf"] },
        maxSize: maxFileSize,
    });

    const file = acceptedFiles[0] || null;

        return (
        <div className="w-full gradient-border">
            <div {...getRootProps()}>
                <input {...getInputProps()} />

                <div className="space-y-4 cursor-pointer">
                    {file ? (
                        <div
                            className="uploader-selected-file"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-accent-400 rounded-lg flex items-center justify-center">
                                <svg
                                    className="w-6 h-6 text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div>
                                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">
                                        {file.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {formatSize(file.size)}
                                    </p>
                                </div>
                            </div>
                            <button
                                className="p-2 cursor-pointer hover:bg-gray-200 rounded-lg transition-colors"
                                onClick={(e) => {
                                    onFileSelect?.(null);
                                }}
                            >
                                <svg
                                    className="w-4 h-4 text-gray-500 hover:text-gray-700"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="mx-auto w-20 h-20 bg-gradient-to-r from-primary-500 to-accent-400 rounded-full flex items-center justify-center mb-4 float-effect">
                                <svg
                                    className="w-10 h-10 text-white"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                    />
                                </svg>
                            </div>
                            <p className="text-lg text-gray-600 mb-2">
                                <span className="font-semibold text-gray-800">
                                    Click to upload
                                </span>{" "}
                                or drag and drop
                            </p>
                            <p className="text-lg text-gray-500">
                                PDF files only (max {formatSize(maxFileSize)})
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default FileUploader;

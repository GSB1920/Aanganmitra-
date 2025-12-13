"use client";

import SubmitButton from "./submit-button";
import { useUploadContext } from "./upload-context";

export default function SaveSubmit() {
  const { uploading } = useUploadContext();
  return <SubmitButton variant="primary" disabled={uploading}>Save Changes</SubmitButton>;
}

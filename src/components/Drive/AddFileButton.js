import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useAuth } from "../../context/AuthContext";
import { database, storage } from "../../firebase";
import { ROOT_FOLDER } from "../hooks/useFolder";
import { v4 as uuidV4 } from "uuid";
import { ProgressBar, Toast } from "react-bootstrap";

export default function AddFileButton({ currentFolder }) {
  const [uploadingFile, setUploadingFile] = useState([]);
  const { currentUser } = useAuth();
  function handleUpload(e) {
    const file = e.target.files[0];
    if (currentFolder == null || file == null) return;

    const id = uuidV4();
    setUploadingFile((prevUploadingFiles) => [
      ...prevUploadingFiles,
      { id: id, name: file.name, progress: 0, error: false },
    ]);
    const filepath =
      currentFolder === ROOT_FOLDER
        ? `${currentFolder.path.join("/")}/${file.name}`
        : `${currentFolder.path.join("/")}/${currentFolder.name}/${file.name}`;

    const uploadTask = storage
      .ref(`files/${currentUser.uid}/${filepath}`)
      .put(file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = snapshot.bytesTransferred / snapshot.totalBytes;
        console.log("uploading");
        setUploadingFile((prevUploadingFiles) => {
          return prevUploadingFiles.map((uploadingFile) => {
            if (uploadingFile.id === id) {
              return { ...uploadingFile, progress: progress };
            }

            return uploadingFile;
          });
        });
      },
      (error) => {
        setUploadingFile((prevUploadingFiles) => {
          return prevUploadingFiles.map((uploadFile) => {
            if (uploadFile.id === id) {
              return { ...uploadFile, error: true };
            }
            return uploadFile;
          });
        });
      },
      () => {
        setUploadingFile((prevUploadingFiles) => {
          return prevUploadingFiles.filter((uploadFile) => {
            return uploadFile.id !== id;
          });
        });

        uploadTask.snapshot.ref.getDownloadURL().then((url) => {
          database.files.add({
            url: url,
            name: file.name,
            createdAt: database.getCurrentTimeStamp,
            folderId: currentFolder.id,
            userId: currentUser.uid,
          });
        });
      }
    );
  }
  return (
    <>
      <label
        className="btn btn-outline-success btn-sm ml-0 mr-2"
        style={{ marginRight: "10px" }}
      >
        <FontAwesomeIcon icon={faFileUpload} />
        <input
          type="file"
          onChange={handleUpload}
          style={{ opacity: "0", position: "absolute", left: "-9999px" }}
        />
      </label>
      {uploadingFile.length > 0 &&
        ReactDOM.createPortal(
          <div
            style={{
              position: "absolute",
              bottom: "1rem",
              right: "1rem",
              maxWidth: "250px",
            }}
          >
            {uploadingFile.map((file) => (
              <Toast
                key={file.id}
                onClose={() => {
                  setUploadingFile((prevUploadingFiles) => {
                    return prevUploadingFiles.filter((uploadfile) => {
                      return uploadfile.id !== file.id;
                    });
                  });
                }}
              >
                <Toast.Header
                  closeButton={file.error}
                  className="text-truncate w-100 d-block"
                >
                  {file.name}
                </Toast.Header>
                <Toast.Body>
                  <ProgressBar
                    variant={file.error ? "danger" : "primary"}
                    animated={!file.error}
                    now={file.error ? 100 : file.progress * 100}
                    label={
                      file.error
                        ? "Error"
                        : `${Math.round(file.progress * 100)}%`
                    }
                  />
                </Toast.Body>
              </Toast>
            ))}
          </div>,
          document.body
        )}
    </>
  );
}

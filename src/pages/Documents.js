import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { FiCheckCircle, FiFile, FiTrash2, FiUploadCloud } from 'react-icons/fi';

export default function Documents() {
  const inputRef = useRef(null);
  const user = useSelector((state) => state.auth.user);
  const isHR = user.type !== 'employee';
  const requiredDocuments = [
    { key: 'aadhaar', label: 'Aadhaar Card', description: 'Identity proof' },
    { key: 'pan', label: 'PAN Card', description: 'Identity and tax proof' },
    { key: 'experience', label: 'Experience Letter', description: 'Previous employment proof' },
  ];
  const loadFiles = () => JSON.parse(localStorage.getItem('employeeDocuments') || '[]');
  const [files, setFiles] = useState(loadFiles);

  const saveFiles = (nextFiles) => {
    setFiles(nextFiles);
    localStorage.setItem('employeeDocuments', JSON.stringify(nextFiles));
  };

  const upload = (event) => {
    const documentKey = event.target.dataset.document;
    const requiredDocument = requiredDocuments.find((document) => document.key === documentKey);
    const uploaded = [...event.target.files].map((file) => ({
      name: file.name,
      type: requiredDocument.label,
      documentKey,
      size: `${Math.max(1, Math.round(file.size / 1024))} KB`,
      complete: false,
    }));
    const withoutPrevious = files.filter((file) => file.documentKey !== documentKey);
    saveFiles([...withoutPrevious, ...uploaded]);
    event.target.value = '';
  };

  const setVerified = (index) => {
    saveFiles(files.map((file, fileIndex) => fileIndex === index ? { ...file, complete: true, verifiedAt: new Date().toISOString(), verifiedBy: user.name } : file));
  };

  const removeFile = (index) => saveFiles(files.filter((_, fileIndex) => fileIndex !== index));

  return (
    <>
      <div className="page-heading"><div><span>EMPLOYEE FILES</span><h1>Documents</h1><p>Upload and manage required onboarding documents.</p></div></div>
      <section className="document-layout">
        {!isHR && <article className="panel required-document-panel">
          <div className="panel-heading"><div><h2>Required employee documents</h2><p>Upload each document listed below.</p></div></div>
          {requiredDocuments.map((document) => {
            const uploaded = files.find((file) => file.documentKey === document.key);
            return (
              <div className="required-document-row" key={document.key}>
                <div className="file-icon"><FiFile /></div>
                <div><strong>{document.label}</strong><small>{document.description}</small>{uploaded && <small className="uploaded-name">{uploaded.name}</small>}</div>
                <label className="upload-small-button">
                  <FiUploadCloud /> {uploaded ? 'Replace' : 'Upload'}
                  <input ref={inputRef} type="file" data-document={document.key} onChange={upload} hidden accept=".pdf,.jpg,.jpeg,.png" />
                </label>
              </div>
            );
          })}
          <small className="upload-help">PDF, JPG or PNG. Maximum file size: 10 MB.</small>
        </article>}
        <article className="panel document-list">
          <div className="panel-heading"><div><h2>{isHR ? 'HR document verification' : 'Upload status'}</h2><p>{requiredDocuments.filter((document) => files.some((file) => file.documentKey === document.key && file.complete)).length} of 3 documents verified</p></div></div>
          {files.map((file, index) => (
            <div className="document-row" key={`${file.name}-${index}`}><div className="file-icon"><FiFile /></div><div><strong>{file.name}</strong><small>{file.type} · {file.size}</small></div>
              {file.complete && <FiCheckCircle className="verified" />}
              {isHR && !file.complete && <button className="verify-button" onClick={() => setVerified(index)}>Verify</button>}
              {!isHR && <button onClick={() => removeFile(index)} aria-label={`Delete ${file.name}`}><FiTrash2 /></button>}
            </div>
          ))}
          {!files.length && <div className="empty-documents">No documents uploaded yet.</div>}
        </article>
      </section>
    </>
  );
}

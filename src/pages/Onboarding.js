import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiBriefcase, FiCheck, FiFileText, FiHome, FiPhone, FiUser } from 'react-icons/fi';
import { addEmployee, updateEmployee } from '../features/employees/employeesSlice';

const emptyForm = {
  name: '', email: '', phone: '', profilePhoto: '', dateOfBirth: '', gender: '', maritalStatus: '',
  nationality: '', currentAddress: '', city: '', state: '', pinCode: '',
  emergencyName: '', emergencyRelation: '', emergencyPhone: '',
  highestQualification: '', university: '', yearOfPassing: '', experience: '',
  previousEmployer: '', previousDesignation: '', role: '', department: '',
  employmentType: 'Full Time', startDate: '', reportingManager: '',
  bankName: '', accountNumber: '', ifscCode: '', panNumber: '', aadhaarNumber: '',
};

export default function Onboarding() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const employees = useSelector((state) => state.employees.items);
  const existingEmployee = employees.find((employee) => employee.loginEmail === user.email || employee.email === user.email);
  const onboardingCompleted = existingEmployee?.status === 'Verified & Onboarding Complete';
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState(existingEmployee || emptyForm);

  const update = (event) => {
    setForm({ ...form, [event.target.name]: event.target.value });
    setErrors({ ...errors, [event.target.name]: '' });
  };

  const updateProfilePhoto = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrors({ ...errors, profilePhoto: 'Please select an image file' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ ...errors, profilePhoto: 'Photo must be smaller than 5 MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 400;
        const scale = Math.min(size / image.width, size / image.height, 1);
        canvas.width = Math.round(image.width * scale);
        canvas.height = Math.round(image.height * scale);
        canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
        setForm({ ...form, profilePhoto: canvas.toDataURL('image/jpeg', 0.82) });
        setErrors({ ...errors, profilePhoto: '' });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const requiredFields = {
    1: ['name', 'email', 'phone', 'dateOfBirth', 'gender', 'maritalStatus', 'nationality'],
    2: ['currentAddress', 'city', 'state', 'pinCode', 'emergencyName', 'emergencyRelation', 'emergencyPhone'],
    3: ['highestQualification', 'university', 'yearOfPassing', 'experience'],
    4: ['role', 'department', 'employmentType', 'startDate'],
    5: ['bankName', 'accountNumber', 'ifscCode', 'panNumber', 'aadhaarNumber'],
  };

  const validateStep = () => {
    const nextErrors = {};
    requiredFields[step].forEach((field) => {
      if (!form[field].trim()) nextErrors[field] = 'This field is required';
    });
    if (step === 1 && form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Enter a valid email address';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const continueStep = () => {
    if (validateStep()) setStep((current) => Math.min(5, current + 1));
  };

  const submit = (event) => {
    event.preventEvent?.();
    event.preventDefault();
    if (!validateStep()) return;
    const employeeData = { ...form, loginEmail: user.email, reviewStatus: 'Submitted to HR', email: form.email || user.email };
    if (existingEmployee) dispatch(updateEmployee({ id: existingEmployee.id, data: employeeData }));
    else dispatch(addEmployee(employeeData));
    const notifications = JSON.parse(localStorage.getItem('employeeEmailNotifications') || '[]');
    notifications.unshift({
      to: 'HR',
      recipient: 'HR',
      subject: 'New employee onboarding submitted',
      message: `${employeeData.name} submitted a complete onboarding profile for HR review.`,
      sentAt: new Date().toISOString(),
    });
    localStorage.setItem('employeeEmailNotifications', JSON.stringify(notifications));
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="submission-success panel">
        <span><FiCheck /></span><h1>Onboarding submitted</h1>
        <p>Your complete profile has been sent to the HR department for review.</p>
        <button className="primary-button" onClick={() => navigate('/profile')}>View my profile</button>
      </div>
    );
  }

  if (onboardingCompleted) {
    return (
      <div className="submission-success panel completed-onboarding">
        <span><FiCheck /></span>
        <small>ONBOARDING COMPLETED</small>
        <h1>Congratulations, {existingEmployee.name}</h1>
        <p>Your profile and documents have been verified. Your onboarding process is complete.</p>
        <button className="primary-button" onClick={() => navigate('/profile')}>View completed profile</button>
      </div>
    );
  }

  const titles = [
    ['Personal details', 'Personal information', FiUser],
    ['Address & emergency', 'Contact information', FiHome],
    ['Education & experience', 'Background information', FiFileText],
    ['Joining details', 'Job and employment details', FiBriefcase],
    ['Bank & identity details', 'Payroll and identification', FiPhone],
  ];

  return (
    <>
      <div className="page-heading"><div><span>EMPLOYEE SELF-SERVICE</span><h1>Complete your onboarding</h1><p>Fill in all required details. Your information will be sent to HR after submission.</p></div></div>
      <div className="form-layout onboarding-layout">
        <aside className="stepper panel">
          {titles.map(([shortTitle, longTitle, Icon], index) => (
            <button type="button" key={shortTitle} className={step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''} onClick={() => index + 1 < step && setStep(index + 1)}>
              <span>{step > index + 1 ? <FiCheck /> : index + 1}</span>
              <div><strong>{shortTitle}</strong><small>{longTitle}</small></div>
            </button>
          ))}
        </aside>

        <form className="panel onboarding-form" onSubmit={submit} noValidate>
          <div className="onboarding-step-heading"><span>STEP {step} OF 5</span><h2>{titles[step - 1][0]}</h2><p>Fields marked with an asterisk are required.</p></div>
          <div className="form-grid">
            {step === 1 && <>
              <div className="profile-photo-field full-field">
                <label htmlFor="profilePhoto">Profile photo</label>
                <div className="profile-photo-upload">
                  {form.profilePhoto
                    ? <img src={form.profilePhoto} alt="Profile preview" />
                    : <span><FiUser /></span>}
                  <div><input id="profilePhoto" name="profilePhoto" type="file" accept="image/*" onChange={updateProfilePhoto} /><small>JPG, PNG or other image formats. Maximum 5 MB.</small></div>
                </div>
                {errors.profilePhoto && <small className="field-error">{errors.profilePhoto}</small>}
              </div>
              <Field label="Full name" name="name" value={form.name} update={update} error={errors.name} placeholder="Enter your full name" required />
              <Field label="Personal email" name="email" type="email" value={form.email} update={update} error={errors.email} placeholder="name@email.com" required />
              <Field label="Mobile number" name="phone" value={form.phone} update={update} error={errors.phone} placeholder="+91 98765 43210" required />
              <Field label="Date of birth" name="dateOfBirth" type="date" value={form.dateOfBirth} update={update} error={errors.dateOfBirth} required />
              <Select label="Gender" name="gender" value={form.gender} update={update} error={errors.gender} options={['Female', 'Male', 'Non-binary', 'Prefer not to say']} required />
              <Select label="Marital status" name="maritalStatus" value={form.maritalStatus} update={update} error={errors.maritalStatus} options={['Single', 'Married', 'Other']} required />
              <Field label="Nationality" name="nationality" value={form.nationality} update={update} error={errors.nationality} placeholder="e.g. Indian" required />
            </>}
            {step === 2 && <>
              <div className="field full-field"><label>Current address *</label><textarea name="currentAddress" value={form.currentAddress} onChange={update} placeholder="House number, street and landmark" />{errors.currentAddress && <small>{errors.currentAddress}</small>}</div>
              <Field label="City" name="city" value={form.city} update={update} error={errors.city} placeholder="City" required />
              <Field label="State" name="state" value={form.state} update={update} error={errors.state} placeholder="State" required />
              <Field label="PIN code" name="pinCode" value={form.pinCode} update={update} error={errors.pinCode} placeholder="PIN code" required />
              <Field label="Emergency contact name" name="emergencyName" value={form.emergencyName} update={update} error={errors.emergencyName} placeholder="Contact person" required />
              <Field label="Relationship" name="emergencyRelation" value={form.emergencyRelation} update={update} error={errors.emergencyRelation} placeholder="e.g. Father" required />
              <Field label="Emergency contact number" name="emergencyPhone" value={form.emergencyPhone} update={update} error={errors.emergencyPhone} placeholder="+91 98765 43210" required />
            </>}
            {step === 3 && <>
              <Field label="Highest qualification" name="highestQualification" value={form.highestQualification} update={update} error={errors.highestQualification} placeholder="e.g. B.Tech" required />
              <Field label="University / College" name="university" value={form.university} update={update} error={errors.university} placeholder="Institution name" required />
              <Field label="Year of passing" name="yearOfPassing" type="number" value={form.yearOfPassing} update={update} error={errors.yearOfPassing} placeholder="YYYY" required />
              <Field label="Total work experience" name="experience" value={form.experience} update={update} error={errors.experience} placeholder="e.g. 2 years" required />
              <Field label="Previous employer" name="previousEmployer" value={form.previousEmployer} update={update} placeholder="Company name" />
              <Field label="Previous designation" name="previousDesignation" value={form.previousDesignation} update={update} placeholder="Job title" />
            </>}
            {step === 4 && <>
              <Field label="Designation" name="role" value={form.role} update={update} error={errors.role} placeholder="Job title" required />
              <Select label="Department" name="department" value={form.department} update={update} error={errors.department} options={['Engineering', 'Design', 'Human Resources', 'Operations', 'Finance', 'Sales', 'Marketing']} required />
              <Select label="Employment type" name="employmentType" value={form.employmentType} update={update} error={errors.employmentType} options={['Full Time', 'Part Time', 'Contract', 'Intern']} required />
              <Field label="Joining date" name="startDate" type="date" value={form.startDate} update={update} error={errors.startDate} required />
              <Field label="Reporting manager" name="reportingManager" value={form.reportingManager} update={update} placeholder="Manager name, if known" />
            </>}
            {step === 5 && <>
              <Field label="Bank name" name="bankName" value={form.bankName} update={update} error={errors.bankName} placeholder="Bank name" required />
              <Field label="Account number" name="accountNumber" value={form.accountNumber} update={update} error={errors.accountNumber} placeholder="Account number" required />
              <Field label="IFSC code" name="ifscCode" value={form.ifscCode} update={update} error={errors.ifscCode} placeholder="IFSC code" required />
              <Field label="PAN number" name="panNumber" value={form.panNumber.toUpperCase()} update={update} error={errors.panNumber} placeholder="ABCDE1234F" required />
              <Field label="Aadhaar number" name="aadhaarNumber" value={form.aadhaarNumber} update={update} error={errors.aadhaarNumber} placeholder="12-digit Aadhaar number" required />
            </>}
          </div>
          <div className="form-actions">
            {step > 1 && <button type="button" className="secondary-button" onClick={() => setStep(step - 1)}>Back</button>}
            {step < 5
              ? <button type="button" className="primary-button" onClick={continueStep}>Save & continue</button>
              : <button type="submit" className="primary-button">Submit complete profile to HR</button>}
          </div>
        </form>
      </div>
    </>
  );
}

function Field({ label, name, value, update, error, type = 'text', placeholder, required }) {
  return <div className="field"><label htmlFor={name}>{label}{required ? ' *' : ''}</label><input id={name} name={name} type={type} value={value} onChange={update} placeholder={placeholder} />{error && <small>{error}</small>}</div>;
}

function Select({ label, name, value, update, error, options, required }) {
  return <div className="field"><label htmlFor={name}>{label}{required ? ' *' : ''}</label><select id={name} name={name} value={value} onChange={update}><option value="">Select {label.toLowerCase()}</option>{options.map((option) => <option key={option}>{option}</option>)}</select>{error && <small>{error}</small>}</div>;
}

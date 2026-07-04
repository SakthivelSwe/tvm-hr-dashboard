import { Injectable } from '@angular/core';
import { CompanyFolder, DocTemplate, DocType, TemplateField } from '../models/template.models';

// Shared field sets ------------------------------------------------------------------------

const commonEmployee: TemplateField[] = [
  { key: 'employeeName', label: 'Employee Name', type: 'text', default: 'Sakthivel V', group: 'Employee' },
  { key: 'employeeId',   label: 'Employee ID',   type: 'text', default: '5720444',    group: 'Employee' },
  { key: 'designation',  label: 'Designation',   type: 'text', default: 'Software Engineer', group: 'Employee' },
  { key: 'department',   label: 'Department',    type: 'text', default: 'Engineering', group: 'Employee' },
  { key: 'location',     label: 'Location',      type: 'text', default: 'Chennai',    group: 'Employee' }
];

const commonCompany = (c: CompanyFolder): TemplateField[] => [
  { key: 'companyName',    label: 'Company Name',    type: 'text', default: c.fullName, group: 'Company' },
  { key: 'companyAddress', label: 'Company Address', type: 'textarea', default: c.address, group: 'Company' },
  { key: 'companyPhone',   label: 'Company Phone',   type: 'text', default: c.phone,    group: 'Company' },
  { key: 'companyWebsite', label: 'Company Website', type: 'text', default: c.website,  group: 'Company' }
];

// Letterhead helper injected as HTML
const letterhead = (c: CompanyFolder) => `
<div class="letterhead">
  ${c.logo ? `<img src="${c.logo}" alt="${c.name}"/>` : `<h1 style="color:${c.color};margin:0;">${c.name}</h1>`}
  <div style="color:${c.color};font-weight:600;letter-spacing:.5px;margin-top:6px;">${c.fullName}</div>
  <div style="font-size:11px;color:#6b7280;">{{companyAddress}}</div>
</div>`;

const footerBlock = `
<div class="footer-block">
  <strong>{{companyName}}</strong><br/>
  {{companyAddress}}<br/>
  {{companyPhone}} &nbsp;|&nbsp; {{companyWebsite}}
</div>`;

// Companies --------------------------------------------------------------------------------

const TVM: CompanyFolder = {
  slug: 'tvm',
  name: 'TVM',
  fullName: 'TVM Infotech Private Limited',
  logo: 'tvm-logo.png',
  address: '189A 1st Floor, Kamakoti Nagar, 1st Main Road, 7th cross street, Pallikaranai, Chennai – 600100',
  phone: '+91 9710112080, +91 9150871694',
  website: 'www.tvminfotech.com',
  color: '#1a3a7e',
  docTypes: []
};


const DOC_TYPES: DocType[] = [
  { slug: 'offer-letter',    label: 'Offer Letters',    icon: 'mail',          color: '#1a3a7e', description: 'Employment offers for new hires' },
  { slug: 'relieving-letter',label: 'Relieving Letters',icon: 'exit_to_app',   color: '#dc2626', description: 'Confirm end of employment' },
  { slug: 'service-letter',  label: 'Service Letters',  icon: 'workspace_premium', color: '#0f766e', description: 'Certify service and tenure' },
  { slug: 'payslip',         label: 'Payslips',         icon: 'receipt_long',  color: '#f5b301', description: 'Monthly salary statements' }
];

TVM.docTypes = DOC_TYPES;

// Template HTML factories ------------------------------------------------------------------

const offerLetterHtml = (c: CompanyFolder) => `
${letterhead(c)}
<p style="text-align:right;"><strong>Date:</strong> {{issueDate}}</p>
<p><strong>To,</strong><br/>
{{employeeName}}<br/>
{{candidateAddress}}</p>

<h2 style="text-align:center;margin:24px 0;">Offer of Employment</h2>

<p>Dear <strong>{{employeeName}}</strong>,</p>

<p>We are pleased to offer you the position of <strong>{{designation}}</strong> at <strong>{{companyName}}</strong>,
based at our <strong>{{location}}</strong> office. Your appointment is effective from
<strong>{{joiningDate}}</strong>.</p>

<h3>Compensation</h3>
<p>Your annual Cost to Company (CTC) will be <strong>₹ {{ctc}}</strong>, broken down as per the salary
annexure attached with this letter. Salary is payable monthly by direct bank transfer.</p>

<h3>Terms &amp; Conditions</h3>
<div>{{terms}}</div>

<p>This offer is contingent upon successful completion of background verification and submission of
the required documents. Please sign a copy of this letter as an acceptance of the offer.</p>

<div class="signature">
  <p>Warm regards,<br/><br/>
  <strong>{{signatoryName}}</strong><br/>
  {{signatoryDesignation}}<br/>
  {{companyName}}</p>
</div>
${footerBlock}
`;

const relievingLetterHtml = (c: CompanyFolder) => `
${letterhead(c)}
<p style="text-align:right;"><strong>Date:</strong> {{issueDate}}</p>
<p><strong>To,</strong><br/>{{employeeName}}<br/>Employee ID: {{employeeId}}</p>

<h2 style="text-align:center;margin:24px 0;">Relieving Letter</h2>

<p>Dear <strong>{{employeeName}}</strong>,</p>

<p>This is to confirm that your resignation from the position of <strong>{{designation}}</strong> at
<strong>{{companyName}}</strong> has been accepted, and you have been relieved from your duties with
effect from the close of business on <strong>{{relievingDate}}</strong>.</p>

<p>You served the organization from <strong>{{joiningDate}}</strong> to <strong>{{relievingDate}}</strong>.
During your tenure, we found your conduct to be <strong>{{conduct}}</strong>.</p>

<p>Your full and final settlement has been processed as per company policy. We take this opportunity
to thank you for your valuable contribution and wish you the very best in your future endeavors.</p>

<div class="signature">
  <p>For <strong>{{companyName}}</strong>,<br/><br/>
  <strong>{{signatoryName}}</strong><br/>
  {{signatoryDesignation}}</p>
</div>
${footerBlock}
`;

const serviceLetterHtml = (c: CompanyFolder) => `
${letterhead(c)}
<p style="text-align:right;"><strong>Date:</strong> {{issueDate}}</p>

<h2 style="text-align:center;margin:24px 0;">Service Certificate</h2>

<p><strong>TO WHOMSOEVER IT MAY CONCERN</strong></p>

<p>This is to certify that <strong>{{employeeName}}</strong> (Employee ID: <strong>{{employeeId}}</strong>)
was employed with <strong>{{companyName}}</strong> as <strong>{{designation}}</strong> in the
<strong>{{department}}</strong> department from <strong>{{joiningDate}}</strong> to
<strong>{{relievingDate}}</strong>.</p>

<p>During his/her tenure, we found him/her to be <strong>{{conduct}}</strong>, sincere, and hardworking.
His/her last drawn annual CTC was <strong>₹ {{lastCtc}}</strong>.</p>

<p>We wish him/her all the very best for future endeavors.</p>

<div class="signature">
  <p>For <strong>{{companyName}}</strong>,<br/><br/>
  <strong>{{signatoryName}}</strong><br/>
  {{signatoryDesignation}}</p>
</div>
${footerBlock}
`;

const payslipHtml = (c: CompanyFolder) => `
<div class="payslip">
  <div class="ps-logo">
    ${c.logo ? `<img src="${c.logo}" alt="${c.name}"/>` : `<h1 style="color:${c.color};margin:0;">${c.name}</h1>`}
  </div>

  <div class="ps-title"><u>Pay Slip For The Month of {{payMonth}}</u></div>

  <table class="ps-table">
    <tr class="ps-blueline"><td colspan="4">&nbsp;</td></tr>
    <tr><th>Employee Name</th><td>{{employeeName}}</td><th>Joining Date</th><td>{{joiningDate}}</td></tr>
    <tr><th>Employee Id</th><td>{{employeeId}}</td><th>Location</th><td>{{location}}</td></tr>
    <tr><th>Designation</th><td>{{designation}}</td><th>NWD</th><td>{{nwd}}</td></tr>
    <tr><th>PAN No</th><td>{{panNo}}</td><th>LOP Day(s)</th><td>{{lop}}</td></tr>
    <tr><th>DOB</th><td>{{dob}}</td><th>Bank Account</th><td>{{bankAccount}}</td></tr>
    <tr><th>UAN</th><td>{{uan}}</td><th>PF</th><td>{{pfNumber}}</td></tr>
  </table>

  <table class="ps-table ps-ed">
    <tr class="ps-head"><th colspan="2">Earnings</th><th colspan="2">Deductions</th></tr>
    <tr><td class="lbl">Basic Salary</td><td class="amt">{{basic}}</td><td class="lbl">Professional Tax</td><td class="amt">{{pt}}</td></tr>
    <tr><td class="lbl">House Rent Allowance</td><td class="amt">{{hra}}</td><td class="lbl">Income Tax</td><td class="amt">{{it}}</td></tr>
    <tr><td class="lbl">Medical Allowance</td><td class="amt">{{medical}}</td><td class="lbl">Leave Deductions</td><td class="amt">{{leaveDed}}</td></tr>
    <tr><td class="lbl">Conveyance Allowance</td><td class="amt">{{conveyance}}</td><td class="lbl">Other Deductions</td><td class="amt">{{otherDed}}</td></tr>
    <tr><td class="lbl">Flexi Benefit Plan</td><td class="amt">{{flexi}}</td><td class="lbl">PF /ESI Deductions</td><td class="amt">{{pfEsi}}</td></tr>
    <tr><td class="lbl">Leave Travel Allowance</td><td class="amt">{{lta}}</td><td class="lbl">Variable Pay</td><td class="amt">{{variable}}</td></tr>
    <tr><td class="lbl">Special Allowance</td><td class="amt">{{special}}</td><td class="lbl"></td><td class="amt"></td></tr>
    <tr class="ps-total"><th class="lbl">Total</th><th class="amt">{{totalEarnings}}</th><th class="lbl">Total</th><th class="amt">{{totalDeductions}}</th></tr>
    <tr class="ps-net"><th class="lbl">Net Salary:-</th><th class="amt">{{netSalary}}</th><th class="lbl"></th><th class="amt"></th></tr>
  </table>

  <p class="ps-signature">(This is a system generated statement and requires no signature)</p>

  <div class="ps-footer">
    <div class="ps-company">{{companyName}}</div>
    <div class="ps-footer-details">{{companyAddress}}<br/>{{companyPhone}}<br/>{{companyWebsite}}</div>
  </div>
</div>
`;

// Field sets per doc type ------------------------------------------------------------------

function offerFields(c: CompanyFolder): TemplateField[] {
  return [
    ...commonEmployee,
    { key: 'candidateAddress', label: 'Candidate Address', type: 'textarea', default: '123, Sample Street, Chennai', group: 'Employee' },
    { key: 'issueDate',     label: 'Issue Date',    type: 'date', default: new Date().toISOString().substring(0,10), group: 'Dates' },
    { key: 'joiningDate',   label: 'Joining Date',  type: 'date', default: '2026-04-01', group: 'Dates' },
    { key: 'ctc',           label: 'Annual CTC (₹)', type: 'currency', default: '6,00,000', group: 'Compensation' },
    { key: 'terms',         label: 'Terms & Conditions', type: 'textarea',
      default: '• Probation period of 6 months.\n• 30 days notice period after confirmation.\n• Non-disclosure and non-compete apply as per company policy.',
      group: 'Compensation' },
    { key: 'signatoryName',        label: 'Signatory Name',        type: 'text', default: 'Ravi Kumar', group: 'Signatory' },
    { key: 'signatoryDesignation', label: 'Signatory Designation', type: 'text', default: 'Head of Human Resources', group: 'Signatory' },
    ...commonCompany(c)
  ];
}

function relievingFields(c: CompanyFolder): TemplateField[] {
  return [
    ...commonEmployee,
    { key: 'issueDate',     label: 'Issue Date',     type: 'date', default: new Date().toISOString().substring(0,10), group: 'Dates' },
    { key: 'joiningDate',   label: 'Joining Date',   type: 'date', default: '2024-02-19', group: 'Dates' },
    { key: 'relievingDate', label: 'Relieving Date', type: 'date', default: '2026-03-31', group: 'Dates' },
    { key: 'conduct',       label: 'Conduct',        type: 'text', default: 'good and professional', group: 'Remarks' },
    { key: 'signatoryName',        label: 'Signatory Name',        type: 'text', default: 'Ravi Kumar', group: 'Signatory' },
    { key: 'signatoryDesignation', label: 'Signatory Designation', type: 'text', default: 'Head of Human Resources', group: 'Signatory' },
    ...commonCompany(c)
  ];
}

function serviceFields(c: CompanyFolder): TemplateField[] {
  return [
    ...commonEmployee,
    { key: 'issueDate',     label: 'Issue Date',     type: 'date', default: new Date().toISOString().substring(0,10), group: 'Dates' },
    { key: 'joiningDate',   label: 'Joining Date',   type: 'date', default: '2024-02-19', group: 'Dates' },
    { key: 'relievingDate', label: 'Last Working Day', type: 'date', default: '2026-03-31', group: 'Dates' },
    { key: 'lastCtc',       label: 'Last Drawn Annual CTC (₹)', type: 'currency', default: '7,20,000', group: 'Compensation' },
    { key: 'conduct',       label: 'Conduct',        type: 'text', default: 'a diligent, ethical', group: 'Remarks' },
    { key: 'signatoryName',        label: 'Signatory Name',        type: 'text', default: 'Ravi Kumar', group: 'Signatory' },
    { key: 'signatoryDesignation', label: 'Signatory Designation', type: 'text', default: 'Head of Human Resources', group: 'Signatory' },
    ...commonCompany(c)
  ];
}

function payslipFields(c: CompanyFolder): TemplateField[] {
  return [
    { key: 'employeeName', label: 'Employee Name', type: 'text', default: 'SAKTHIVEL V', group: 'Employee' },
    { key: 'employeeId',   label: 'Employee ID',   type: 'text', default: '5720444',    group: 'Employee' },
    { key: 'designation',  label: 'Designation',   type: 'text', default: 'Software Engineer', group: 'Employee' },
    { key: 'department',   label: 'Department',    type: 'text', default: 'Engineering', group: 'Employee' },
    { key: 'location',     label: 'Location',      type: 'text', default: 'Chennai',    group: 'Employee' },
    { key: 'payMonth', label: 'Pay Month', type: 'text', default: 'March 2026', group: 'Period' },
    { key: 'joiningDate',  label: 'Joining Date',  type: 'text', default: '19-02-2024', group: 'Employee' },
    { key: 'panNo',        label: 'PAN No',        type: 'text', default: '', hint: 'Enter the PAN No', group: 'Employee' },
    { key: 'dob',          label: 'Date of Birth', type: 'text', default: '22-01-2000', group: 'Employee' },
    { key: 'uan',          label: 'UAN',           type: 'text', default: '', hint: 'Enter the UAN', group: 'Employee' },
    { key: 'bankAccount',  label: 'Bank Account',  type: 'text', default: '', hint: 'Enter the Account No', group: 'Employee' },
    { key: 'pfNumber',     label: 'PF Number',     type: 'text', default: '', hint: 'Enter the PF Number', group: 'Employee' },
    { key: 'nwd',          label: 'NWD',           type: 'number', default: '31', group: 'Attendance' },
    { key: 'lop',          label: 'LOP Days',      type: 'number', default: '0', group: 'Attendance' },

    { key: 'basic',        label: 'Basic Salary',        type: 'currency', default: '0.00', group: 'Earnings' },
    { key: 'hra',          label: 'House Rent Allowance',type: 'currency', default: '0.00', group: 'Earnings' },
    { key: 'medical',      label: 'Medical Allowance',   type: 'currency', default: '0.00', group: 'Earnings' },
    { key: 'conveyance',   label: 'Conveyance Allowance',type: 'currency', default: '0.00', group: 'Earnings' },
    { key: 'flexi',        label: 'Flexi Benefit Plan',  type: 'currency', default: '0.00', group: 'Earnings' },
    { key: 'lta',          label: 'Leave Travel Allowance', type: 'currency', default: '0.00', group: 'Earnings' },
    { key: 'special',      label: 'Special Allowance',   type: 'currency', default: '0.00', group: 'Earnings' },

    { key: 'pt',           label: 'Professional Tax',    type: 'currency', default: '0.00', group: 'Deductions' },
    { key: 'it',           label: 'Income Tax',          type: 'currency', default: '0.00', group: 'Deductions' },
    { key: 'leaveDed',     label: 'Leave Deductions',    type: 'currency', default: '0.00', group: 'Deductions' },
    { key: 'otherDed',     label: 'Other Deductions',    type: 'currency', default: '0.00', group: 'Deductions' },
    { key: 'pfEsi',        label: 'PF / ESI Deductions', type: 'currency', default: '0.00', group: 'Deductions' },
    { key: 'variable',     label: 'Variable Pay',        type: 'currency', default: '0.00', group: 'Deductions' },

    { key: 'totalEarnings',   label: 'Total Earnings',   type: 'currency', default: '0.00', group: 'Totals' },
    { key: 'totalDeductions', label: 'Total Deductions', type: 'currency', default: '0.00', group: 'Totals' },
    { key: 'netSalary',       label: 'Net Salary',       type: 'currency', default: '0.00', group: 'Totals' },

    ...commonCompany(c)
  ];
}

function buildTemplatesFor(c: CompanyFolder): DocTemplate[] {
  const stamp = new Date().toISOString();
  return [
    // Offer letters
    { id: `${c.slug}-offer-standard`, company: c.slug, docType: 'offer-letter', name: 'Standard Offer Letter', description: 'Full-time employment offer with standard terms', updated: stamp, html: offerLetterHtml(c), fields: offerFields(c) },
    { id: `${c.slug}-offer-intern`,   company: c.slug, docType: 'offer-letter', name: 'Internship Offer Letter', description: 'Fixed duration internship offer', updated: stamp,
      html: offerLetterHtml(c).replace('Offer of Employment', 'Internship Offer'),
      fields: offerFields(c).map(f => f.key === 'terms' ? { ...f, default: '• Internship duration: 6 months.\n• Stipend paid monthly.\n• Confidentiality applies.' } : f) },

    // Relieving letters
    { id: `${c.slug}-relieving-standard`, company: c.slug, docType: 'relieving-letter', name: 'Standard Relieving Letter', description: 'Confirms relieving after resignation', updated: stamp, html: relievingLetterHtml(c), fields: relievingFields(c) },

    // Service letters
    { id: `${c.slug}-service-standard`, company: c.slug, docType: 'service-letter', name: 'Service Certificate', description: 'Certifies employment period and conduct', updated: stamp, html: serviceLetterHtml(c), fields: serviceFields(c) },

    // Payslip
    { id: `${c.slug}-payslip-monthly`, company: c.slug, docType: 'payslip', name: 'Monthly Payslip', description: 'Monthly salary breakdown', updated: stamp, html: payslipHtml(c), fields: payslipFields(c) }
  ];
}

// Service ----------------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class TemplateService {
  private readonly folders: CompanyFolder[] = [TVM];
  private readonly templates: DocTemplate[] = [
    ...buildTemplatesFor(TVM)
  ];

  getFolders(): CompanyFolder[] { return this.folders; }
  getFolder(slug: string): CompanyFolder | undefined {
    return this.folders.find(f => f.slug === slug);
  }
  getDocTypes(companySlug: string): DocType[] {
    return this.getFolder(companySlug)?.docTypes ?? [];
  }
  getDocType(companySlug: string, docTypeSlug: string): DocType | undefined {
    return this.getDocTypes(companySlug).find(d => d.slug === docTypeSlug);
  }
  getTemplates(companySlug: string, docTypeSlug: string): DocTemplate[] {
    return this.templates.filter(t => t.company === companySlug && t.docType === docTypeSlug);
  }
  getTemplate(id: string): DocTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  /** Replace {{key}} placeholders with the provided values. */
  render(template: DocTemplate, values: Record<string, string>): string {
    return template.html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_m, key) => {
      const v = values[key];
      if (v === undefined || v === null || v === '') return `<span style="color:#9ca3af">[${key}]</span>`;
      // preserve line breaks for textareas
      return String(v).replace(/\n/g, '<br/>');
    });
  }

  buildDefaults(template: DocTemplate): Record<string, string> {
    const values: Record<string, string> = {};
    template.fields.forEach(f => values[f.key] = f.default ?? '');
    return values;
  }
}


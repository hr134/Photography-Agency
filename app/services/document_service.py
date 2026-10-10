import os
import datetime
import json
import base64
from xhtml2pdf import pisa
from flask import current_app
from app.extensions import db
from app.models.document import Document
from app.models.booking import Booking
from app.models.agency_settings import AgencySettings
from app.models.agreement_terms import AgreementTerms
from app.models.package import Package


def generate_pdf_from_html(html_content, output_path):
    with open(output_path, "w+b") as result_file:
        pisa_status = pisa.CreatePDF(html_content.encode("utf-8"), dest=result_file, encoding="utf-8")
    return not pisa_status.err


def get_logo_base64():
    logo_path = os.path.join(os.path.dirname(__file__), "..", "static", "logo.png")
    logo_path = os.path.normpath(logo_path)
    if os.path.exists(logo_path):
        with open(logo_path, "rb") as f:
            data = base64.b64encode(f.read()).decode("utf-8")
        return f"data:image/png;base64,{data}"
    return None


SHARED_CSS = """
@page { 
    size: A4 portrait; 
    margin: 2cm 2cm 3cm 2cm; 
    @frame footer {
        -pdf-frame-content: page_footer;
        bottom: 1cm;
        margin-left: 2cm;
        margin-right: 2cm;
        height: 1cm;
    }
}
body { font-family: Helvetica, Arial, sans-serif; font-size: 11pt; color: #222; line-height: 1.55; }
.page-break { page-break-after: always; }
.doc-header { width: 100%; margin-bottom: 24px; }
.doc-header td { vertical-align: middle; }
.agency-name { font-size: 20pt; font-weight: bold; color: #c9ab84; letter-spacing: 1px; margin: 0; }
.agency-tagline { font-size: 8pt; color: #888; margin: 0; }
.section-title { font-size: 16pt; font-weight: bold; text-align: center; margin: 8px 0 18px 0; text-decoration: underline; color: #333; }
.info-row { margin-bottom: 6px; }
.info-label { font-weight: bold; color: #555; }
.event-table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 10pt; }
.event-table th { background-color: #f5f0ea; border: 1px solid #d5c9b8; padding: 7px 10px; text-align: left; font-weight: bold; color: #5a4a35; }
.event-table td { border: 1px solid #d5c9b8; padding: 7px 10px; vertical-align: top; }
.service-box { background: #fdfaf6; border-left: 4px solid #c9ab84; padding: 14px 16px; margin: 12px 0; font-size: 10pt; }
.service-box h3 { color: #5a4a35; margin: 0 0 8px 0; font-size: 11pt; }
.service-box ul { margin: 4px 0 4px 18px; padding: 0; }
.payment-table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 11pt; }
.payment-table th { background-color: #5a4a35; color: #fff; padding: 9px 14px; text-align: left; }
.payment-table td { border-bottom: 1px solid #e0d8cc; padding: 9px 14px; }
.payment-table .amount { text-align: right; font-weight: bold; }
.payment-note { font-size: 9pt; color: #666; font-style: italic; margin-top: 6px; }
.terms-section h2 { font-size: 13pt; color: #5a4a35; border-bottom: 2px solid #c9ab84; padding-bottom: 4px; margin: 20px 0 10px 0; }
.terms-section h3 { font-size: 11pt; color: #333; margin: 14px 0 4px 0; }
.terms-section p, .terms-section ul, .terms-section ol { font-size: 10pt; margin: 4px 0 8px 18px; }
.ack-box { background: #fdfaf6; border: 1px solid #d5c9b8; padding: 18px 20px; margin: 20px 0; font-size: 10pt; }
.sig-table { width: 100%; margin-top: 40px; }
.sig-table td { width: 50%; vertical-align: bottom; }
.sig-line { border-top: 1px solid #333; width: 80%; margin-bottom: 4px; }
.footer-bar { border-top: 1px solid #c9ab84; margin-top: 30px; padding-top: 8px; text-align: center; font-size: 8pt; color: #888; }
.inv-badge { display: inline-block; background: #c9ab84; color: #fff; padding: 3px 14px; border-radius: 4px; font-size: 13pt; font-weight: bold; letter-spacing: 2px; margin-bottom: 16px; }
"""


def _header(agency, logo_src):
    logo_tag = f'<img src="{logo_src}" style="width:60px;" />' if logo_src else ""
    name = agency.agency_name if agency else "Veloura Creations"
    return f"""<table class="doc-header"><tr>
        <td style="width:70px;">{logo_tag}</td>
        <td style="padding-left:14px;">
            <p class="agency-name">{name}</p>
            <p class="agency-tagline">Photography &amp; Cinematography</p>
        </td></tr></table>"""


def _footer(agency):
    addr = agency.address if agency else "135/1 Gulshan Link Road, Dhaka 1100"
    web = agency.website if agency else "www.velouracreations.com"
    phone = getattr(agency, "primary_phone", None) or getattr(agency, "phone", None) or "+88 01673694261"
    return f'<div class="footer-bar">Our Address: {addr} &nbsp;|&nbsp; Visit: {web} &nbsp;|&nbsp; Call: {phone}</div>'


def format_time_ampm(time_str):
    if not time_str: return ""
    try:
        t = datetime.datetime.strptime(time_str, "%H:%M")
        return t.strftime("%I:%M %p").lstrip("0")
    except:
        return time_str


def build_agreement_html(booking, agency, logo_src):
    name = agency.agency_name if agency else "Veloura Creations"
    extra_rate = int(agency.extra_hour_rate) if agency and agency.extra_hour_rate else 2000
    drive_days = agency.drive_deletion_days if agency and agency.drive_deletion_days else 7
    storage_days = agency.storage_deletion_days if agency and agency.storage_deletion_days else 30
    free_rev = agency.free_revision_count if agency and agency.free_revision_count else 1
    founder_name = agency.founder_name if agency else "Najmul Ahmed"
    
    base_desig = agency.founder_designation if agency and agency.founder_designation else "Chief Photographer"
    founder_desig = f"{base_desig}<br/>Founder of {name}"

    client_name = getattr(booking, "client_name", "")
    client_phone = getattr(booking, "client_phone", "")
    if not client_name and booking.contact_info:
        for line in booking.contact_info.split('\n'):
            if line.startswith('Client:'):
                client_name = line.replace('Client:', '').strip()
            elif line.startswith('Primary Ph:'):
                client_phone = line.replace('Primary Ph:', '').strip()
                
    if not client_name:
        client_name = booking.user.username if booking.user else "Client"
    if not client_phone:
        client_phone = getattr(booking.user, "phone", "") if booking.user else ""

    groom = getattr(booking, "groom_name", "") or ""
    bride = getattr(booking, "bride_name", "") or ""

    def format_team_short(team_req):
        """Format team requirements as: first_word first3_of_second:count
        e.g. chief_photographer:1 -> chief pho:1
             senior_cinematographer:2 -> senior cin:2
        """
        if not team_req: return ""
        try:
            reqs = team_req if isinstance(team_req, dict) else json.loads(team_req)
            arr = []
            for k, v in reqs.items():
                if v and str(v).isdigit() and int(v) > 0 and str(k).lower() != "drone":
                    # k is like 'chief_photographer' or 'senior cinematographer'
                    parts = str(k).replace('_', ' ').split()
                    if len(parts) >= 2:
                        label = f"{parts[0].lower()} {parts[1][:3].lower()}"
                    else:
                        label = str(k).lower()[:8]
                    arr.append(f"{label}:{v}")
            if arr:
                return "<br/><span style='font-size:8pt;color:#666;display:inline-block;word-wrap:break-word;'>(" + ", ".join(arr) + ")</span>"
        except:
            pass
        return ""

    event_rows = ""
    for ev in (booking.events or []):
        pkg = ev.effective_package()
        pkg_name = pkg.name if pkg else ""
        if pkg and pkg.team_requirements:
            pkg_name += format_team_short(pkg.team_requirements)
            
        date_str = ev.event_date.strftime("%d.%m.%Y") if ev.event_date else ""
        time_str = f"{format_time_ampm(ev.start_time)} - {format_time_ampm(ev.end_time)}" if ev.start_time and ev.end_time else format_time_ampm(ev.start_time)
        venue_str = (ev.venue or "") + (", " + ev.location if ev.location else "")
        event_rows += f"<tr><td>{date_str}</td><td>{time_str}</td><td>{ev.event_type or ''}</td><td>{venue_str}</td><td>{pkg_name}</td></tr>"

    total = int(booking.total_amount or 0)
    discount = int(booking.discount or 0)
    final = int(booking.final_amount or total - discount)
    advance = int(booking.advance_paid or 0)
    due = final - advance

    drone_text = ""
    if booking.team_requirements and booking.team_requirements.get("drone"):
        drone_text = "<li>One Drone Coverage.</li>"

    man_power_html = ""

    DEFAULT_DELIVERABLES = ["All photos fully edited.", "One highlight trailer.", "One full-length wedding film."]
    deliverables = DEFAULT_DELIVERABLES
    if booking.deliverables:
        # Admin-customised deliverables for this specific booking
        lines = [d.strip() for d in booking.deliverables.split("\n") if d.strip()]
        deliverables = [d.lstrip('\u2022\u25e6\u2023- ').strip() for d in lines]  # strip •, ○, ‣, -, space
    elif booking.package and booking.package.features:
        if isinstance(booking.package.features, list):
            deliverables = booking.package.features
        elif isinstance(booking.package.features, str):
            if "\n" in booking.package.features:
                deliverables = [f.strip() for f in booking.package.features.split("\n") if f.strip()]
            else:
                deliverables = [f.strip() for f in booking.package.features.split(",") if f.strip()]
    deliverables_html = "".join([f"<li>{d}</li>" for d in deliverables])

    H = _header(agency, logo_src)
    F = _footer(agency)

    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"/><style>{SHARED_CSS}</style></head><body>
<div id="page_footer" style="text-align: right; font-size: 9pt; color: #888;">
    Page <pdf:pagenumber> of <pdf:pagecount>
</div>
{H}<div class="section-title">Agreement Paper</div>
<p class="info-row"><span class="info-label">Client's Name:</span> {client_name} &nbsp;&nbsp; <span class="info-label">Number:</span> {client_phone}</p>
<table class="event-table"><thead><tr><th>Event Date</th><th>Event Time</th><th>Event Type</th><th>Event Venue</th><th>Package</th></tr></thead>
<tbody>{event_rows or '<tr><td colspan="5" style="text-align:center;color:#999;">No events added.</td></tr>'}</tbody></table>
<div class="service-box"><h3>Service Details</h3><ul>
<li><strong>Service Duration:</strong> 5 hours of coverage.</li>
<li><strong>Additional Time:</strong> Any extra hour beyond the package time will be charged at {extra_rate:,} BDT per hour.</li>
<li><strong>Deliverables:</strong><ul>{deliverables_html}{drone_text}</ul></li>
<li><strong>Delivery Method:</strong> Final files will be shared via Google Drive.</li>
<li><strong>Delivery Timeline:</strong> Completed within 4 weeks after the last event date.</li>
<li><strong>Payment Policy:</strong> All outstanding dues must be paid in full on or before the event day.</li>
</ul></div>
{F}<div class="page-break"></div>
{H}<div class="terms-section"><h2>Terms &amp; Conditions</h2>
<h3>1. File &amp; Drive Storage</h3><ul>
<li>Your delivery drive will be deleted after {drive_days} days of handover.</li>
<li>All files from your event will be removed from our computer after {storage_days} days of final delivery.</li>
</ul><p><em>(Please make sure to back up your files within this time.)</em></p>
<h3>2. Service Duration &amp; Extra Time</h3><ul>
<li>Our standard service coverage is 5 hours.</li>
<li>If the event continues beyond this time, additional hourly charges will apply based on your program duration.</li>
</ul>
<h3>3. Out-of-Dhaka Events</h3><ul>
<li>For events outside Dhaka, clients must provide food, transportation, and accommodation for our team.</li>
<li>The client is also responsible for the team's safety and overall arrangements during the assignment.</li>
</ul>
<h3>4. Use of Photos &amp; Videos</h3><ul>
<li>By booking our services, you give <strong>{name}</strong> permission to use selected photos and videos from your event on our social media, website, and promotional materials.</li>
</ul><p><em>(We always respect client privacy and use the media tastefully.)</em></p>
<h3>5. Booking &amp; Advance Payment</h3><ul>
<li>Advance payment is required to confirm your booking. Without it, no date will be reserved.</li>
<li>The advance payment is non-refundable and non-adjustable if the event is canceled by the client.</li>
<li>If the event date or schedule changes, extra charges may apply.</li>
<li>In case <strong>{name}</strong> cancels the booking, the full advance amount will be refunded.</li>
</ul></div>
{F}<div class="page-break"></div>

{H}<div class="terms-section">
<h3>6. Unforeseen Situations</h3><ul>
<li>We may cancel or postpone a contract due to political unrest, natural disasters, or other unavoidable conditions, even on the event day, if necessary.</li>
</ul>
<h3>7. Technical Issues</h3><ul>
<li>We take all possible precautions to protect your data and equipment.</li>
<li>However, in case of unexpected issues such as memory card failure, computer crash, or electrical problems, <strong>{name}</strong> will not be held responsible for data loss or damage beyond our control.</li>
</ul>
<h3>8. Editing &amp; Changes</h3><ul>
<li>{free_rev} round of free editing is included for client feedback.</li>
<li>Any additional edits, song changes, or reworks after that will require an extra charge.</li>
</ul>
<h3>9. Delivery Timeline</h3><ul>
<li>Final edited files will be delivered within 4 Weeks after the last event.</li>
<li>The regular delivery period is up to 20 days for standard projects.</li>
</ul>
<h3>10. Service Agreement</h3><ul>
<li>All services will be provided according to the agreement or selected package.</li>
<li>Anything outside the agreed package will be treated as an additional service and may include extra charges.</li>
</ul></div>
{F}<div class="page-break"></div>

{H}<div class="section-title">Client Acknowledgment</div>
<div class="ack-box">
<p>I confirm that I have read and understood all the above terms and conditions. I agree to the policies of <strong>{name}</strong> and acknowledge that all package details and inclusions have been explained to me.</p>
</div>

<p><strong>Client Signature:</strong> &nbsp;&nbsp;&nbsp; ___________________________</p>
<p><strong>Date:</strong> &nbsp;&nbsp;&nbsp; ___________________________</p>
<br/><br/>
<table class="sig-table"><tr>
<td><div class="sig-line"></div><p style="font-weight:bold;">{founder_name}</p><p style="font-size:9pt;color:#555;">{founder_desig}</p></td>
<td></td></tr></table>
{F}</body></html>"""


def build_invoice_html(booking, agency, logo_src):
    name = agency.agency_name if agency else "Veloura Creations"
    founder_name = agency.founder_name if agency else "Najmul Ahmed"
    
    base_desig = agency.founder_designation if agency and agency.founder_designation else "Chief Photographer"
    founder_desig = f"{base_desig}<br/>Founder of {name}"
    
    groom = booking.groom_name or ""
    bride = booking.bride_name or ""
    client_name = getattr(booking, "client_name", "")
    client_phone = getattr(booking, "client_phone", "")
    if not client_name and booking.contact_info:
        for line in booking.contact_info.split('\n'):
            if line.startswith('Client:'):
                client_name = line.replace('Client:', '').strip()
            elif line.startswith('Primary Ph:'):
                client_phone = line.replace('Primary Ph:', '').strip()
                
    if not client_name:
        client_name = booking.user.username if booking.user else "Client"
    if not client_phone:
        client_phone = getattr(booking.user, "phone", "") if booking.user else ""

    bkash = agency.bkash_number if agency and agency.bkash_number else "N/A"
    nagad = agency.nagad_number if agency and agency.nagad_number else "N/A"
    bank_name = agency.bank_name if agency and agency.bank_name else "N/A"
    bank_acc_name = agency.bank_account_name if agency and agency.bank_account_name else "N/A"
    bank_acc_num = agency.bank_account_number if agency and agency.bank_account_number else "N/A"
    bank_branch = agency.bank_branch if agency and agency.bank_branch else "N/A"
    
    bank2_name = agency.bank2_name if agency and getattr(agency, 'bank2_name', None) else ""
    bank2_acc_name = agency.bank2_account_name if agency and getattr(agency, 'bank2_account_name', None) else ""
    bank2_acc_num = agency.bank2_account_number if agency and getattr(agency, 'bank2_account_number', None) else ""
    bank2_branch = agency.bank2_branch if agency and getattr(agency, 'bank2_branch', None) else ""

    total = int(booking.total_amount or 0)
    discount = int(booking.discount or 0)
    final = int(booking.final_amount or total - discount)
    advance = int(booking.advance_paid or 0)
    due = final - advance

    def format_team_short(team_req):
        """Format team requirements: keep first word, first 3 letters of second.
        e.g. chief_photographer:1 -> chief pho:1
             senior_cinematographer:2 -> senior cin:2
        """
        if not team_req: return ""
        try:
            reqs = team_req if isinstance(team_req, dict) else json.loads(team_req)
            arr = []
            for k, v in reqs.items():
                if v and str(v).isdigit() and int(v) > 0 and str(k).lower() != "drone":
                    parts = str(k).replace('_', ' ').split()
                    if len(parts) >= 2:
                        label = f"{parts[0].lower()} {parts[1][:3].lower()}"
                    else:
                        label = str(k).lower()[:8]
                    arr.append(f"{label}:{v}")
            if arr:
                return "<br/><span style='font-size:8pt;color:#666;display:inline-block;word-wrap:break-word;'>(" + ", ".join(arr) + ")</span>"
        except:
            pass
        return ""

    event_rows = ""
    for ev in (booking.events or []):
        pkg = ev.effective_package()
        pkg_name = pkg.name if pkg else ""
        if pkg and pkg.team_requirements:
            pkg_name += format_team_short(pkg.team_requirements)
            
        date_str = ev.event_date.strftime("%d %b %Y") if ev.event_date else ""
        time_str = f"{format_time_ampm(ev.start_time)} - {format_time_ampm(ev.end_time)}" if ev.start_time and ev.end_time else format_time_ampm(ev.start_time)
        venue_str = (ev.venue or "") + (", " + ev.location if ev.location else "")
        event_rows += f"<tr><td>{date_str}</td><td>{ev.event_type or ''}</td><td>{time_str}</td><td>{venue_str}</td><td>{pkg_name}</td></tr>"

    today = datetime.date.today().strftime("%d %B %Y")
    H = _header(agency, logo_src)
    F = _footer(agency)

    return f"""<!DOCTYPE html><html><head><meta charset="utf-8"/><style>{SHARED_CSS}</style></head><body>
<div id="page_footer" style="text-align: right; font-size: 9pt; color: #888;">
    Page <pdf:pagenumber> of <pdf:pagecount>
</div>
{H}<div class="section-title">Invoice / Payment Slip</div>
<table style="width:100%;margin-bottom:20px;"><tr>
<td style="vertical-align:top;width:50%;font-size:10pt;">
<strong>Bill To:</strong><br/>{client_name}<br/>
<span style="color:#777;">{groom} &amp; {bride}</span><br/>{client_phone}
</td>
<td style="vertical-align:top;width:50%;text-align:right;font-size:10pt;">
<strong>Booking No:</strong> {booking.booking_number or f"BK-{booking.id:06d}"}<br/>
<strong>Invoice Date:</strong> {today}<br/>
<strong>Payment Status:</strong> {booking.payment_status or "UNPAID"}
</td></tr></table>

<table class="event-table"><thead><tr><th>Date</th><th>Event</th><th>Time</th><th>Venue</th><th>Package</th></tr></thead>
<tbody>{event_rows or '<tr><td colspan="5" style="text-align:center;color:#999;">No events.</td></tr>'}</tbody></table>

<table class="payment-table">
<thead><tr><th>Description</th><th style="text-align:right;">Amount (BDT)</th></tr></thead>
<tbody>
<tr><td>Total Package Price</td><td class="amount">{total:,} Taka</td></tr>
<tr><td>Discount</td><td class="amount">- {discount:,} Taka</td></tr>
<tr><td>Final Price</td><td class="amount">{final:,} Taka</td></tr>
<tr><td>Advance Paid</td><td class="amount">- {advance:,} Taka</td></tr>
<tr><td><strong>Balance Due</strong></td><td class="amount" style="color:#c0392b;">{due:,} Taka</td></tr>
</tbody></table>
<p class="payment-note">All outstanding dues must be settled on or before the event day.</p>

<div class="service-box" style="margin-top:20px;margin-bottom:20px;">
  <h3 style="margin-top:0;font-size:11pt;">Payment Methods</h3>
  <table style="width:100%;font-size:10pt;border:none;">
    <tr>
      <td style="width:33%;vertical-align:top;border:none;padding:4px 0;">
        <strong>bKash:</strong> {bkash}<br/>
        <strong>Nagad:</strong> {nagad}
      </td>
      <td style="width:33%;vertical-align:top;border:none;padding:4px 0;">
        <strong>Bank Option 1:</strong><br/>
        <strong>Name:</strong> {bank_name}<br/>
        <strong>Account Name:</strong> {bank_acc_name}<br/>
        <strong>Account No:</strong> {bank_acc_num}<br/>
        <strong>Branch:</strong> {bank_branch}
      </td>
      <td style="width:34%;vertical-align:top;border:none;padding:4px 0;">
        {f'''<strong>Bank Option 2:</strong><br/>
        <strong>Name:</strong> {bank2_name}<br/>
        <strong>Account Name:</strong> {bank2_acc_name}<br/>
        <strong>Account No:</strong> {bank2_acc_num}<br/>
        <strong>Branch:</strong> {bank2_branch}''' if bank2_name else ''}
      </td>
    </tr>
  </table>
</div>
<br/><br/>
<table class="sig-table"><tr>
<td><div class="sig-line"></div><p style="font-weight:bold;">{founder_name}</p><p style="font-size:9pt;color:#555;">{founder_desig}</p></td>
<td></td></tr></table>
{F}</body></html>"""


def create_document(booking_id, doc_type, admin_id):
    booking = Booking.query.get(booking_id)
    if not booking:
        raise ValueError("Booking not found")

    agency = AgencySettings.query.first()
    terms = AgreementTerms.query.filter_by(is_active=True).first()
    logo_src = get_logo_base64()

    if doc_type == "INVOICE":
        html = build_invoice_html(booking, agency, logo_src)
        prefix = "INV"
    elif doc_type == "AGREEMENT":
        html = build_agreement_html(booking, agency, logo_src)
        prefix = "AGR"
    else:
        raise ValueError("Unsupported document type")

    existing = Document.query.filter_by(booking_id=booking.id, doc_type=doc_type).count()
    version = existing + 1
    doc_number = f"{prefix}-{datetime.datetime.utcnow().year}-{booking.id:04d}-V{version}"

    upload_dir = current_app.config.get("UPLOAD_FOLDER", "static/uploads")
    docs_dir = os.path.join(upload_dir, "documents")
    os.makedirs(docs_dir, exist_ok=True)

    filename = f"{doc_number}.pdf"
    file_path = os.path.join(docs_dir, filename)

    success = generate_pdf_from_html(html, file_path)
    if not success:
        raise Exception("PDF generation failed")

    doc = Document(
        doc_number=doc_number,
        doc_type=doc_type,
        version=version,
        booking_id=booking.id,
        client_id=booking.user_id,
        terms_version=terms.version if terms else None,
        agency_snapshot=agency.to_dict() if agency else {},
        package_snapshot=booking.package.to_dict() if booking.package else {},
        payment_snapshot=[p.to_dict() for p in booking.payments],
        pdf_path=f"/static/uploads/documents/{filename}",
        is_finalized=True,
        generated_by=admin_id
    )

    db.session.add(doc)
    db.session.commit()
    return doc

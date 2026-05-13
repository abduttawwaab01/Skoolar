#!/usr/bin/env python3
"""
Generate Comprehensive Skoolar Marketing PDF
Creates a professional, sellable PDF with all portals and how-to guides
"""

import os
import sys
from pathlib import Path

def create_comprehensive_pdf():
    """Create comprehensive marketing PDF"""
    
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, PageBreak, 
            Table, TableStyle, KeepTogether
        )
        from reportlab.lib.colors import HexColor
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
    except ImportError:
        print("Installing reportlab...")
        os.system(f"{sys.executable} -m pip install reportlab -q")
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, PageBreak,
            Table, TableStyle, KeepTogether
        )
        from reportlab.lib.colors import HexColor
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
    
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    pdf_file = project_dir / "SKOOLAR_COMPREHENSIVE_MARKETING.pdf"
    
    print(f"Creating comprehensive marketing PDF...")
    print(f"Output: {pdf_file}")
    
    # Create PDF document
    doc = SimpleDocTemplate(
        str(pdf_file),
        pagesize=A4,
        rightMargin=35,
        leftMargin=35,
        topMargin=45,
        bottomMargin=35
    )
    
    elements = []
    styles = getSampleStyleSheet()
    
    # Define Skoolar branding colors and styles
    primary_green = HexColor('#1B5E3F')
    accent_gold = HexColor('#D4A574')
    
    # Title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=primary_green,
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Subtitle style
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=13,
        textColor=accent_gold,
        spaceAfter=10,
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique'
    )
    
    # Section heading
    heading1_style = ParagraphStyle(
        'CustomHeading1',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=primary_green,
        spaceAfter=10,
        spaceBefore=12,
        fontName='Helvetica-Bold'
    )
    
    # Subsection heading
    heading2_style = ParagraphStyle(
        'CustomHeading2',
        parent=styles['Heading3'],
        fontSize=12,
        textColor=primary_green,
        spaceAfter=6,
        spaceBefore=8,
        fontName='Helvetica-Bold'
    )
    
    # Body text
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=9.5,
        textColor=HexColor('#333333'),
        spaceAfter=6,
        alignment=TA_JUSTIFY,
        leading=12
    )
    
    # ===== COVER PAGE =====
    elements.append(Spacer(1, 1.2*inch))
    
    header = Paragraph("<b>SKOOLAR TECHNOLOGY LTD</b>", subtitle_style)
    elements.append(header)
    
    tagline = Paragraph("<i>Bringing digital solutions to Educational system</i>", 
                       ParagraphStyle('Tagline', parent=styles['Normal'], fontSize=10, 
                                    textColor=HexColor('#666666'), alignment=TA_CENTER))
    elements.append(tagline)
    elements.append(Spacer(1, 0.5*inch))
    
    title = Paragraph("The Complete Institutional Transformation Guide", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.3*inch))
    
    subtitle = Paragraph("All-in-One Digital Solution for Modern Schools", subtitle_style)
    elements.append(subtitle)
    elements.append(Spacer(1, 0.5*inch))
    
    key_points = """
    <b>Complete Portal How-To Guides</b> | <b>ROI Analysis</b> | <b>Implementation Strategy</b><br/>
    <b>Security & Compliance</b> | <b>Success Metrics</b> | <b>Transparent Pricing</b>
    """
    points = Paragraph(key_points, 
                      ParagraphStyle('Points', parent=styles['Normal'], fontSize=9,
                                   textColor=primary_green, alignment=TA_CENTER, leading=13))
    elements.append(points)
    elements.append(Spacer(1, 0.8*inch))
    
    stats_text = """
    <b>90+ Integrated Features</b> | <b>10+ Specialized Portals</b> | <b>500+ Schools Trust Us</b><br/>
    <b>99.9% Uptime Guarantee</b> | <b>4-Week Implementation</b> | <b>ROI in 90 Days</b>
    """
    stats = Paragraph(stats_text, 
                     ParagraphStyle('Stats', parent=styles['Normal'], fontSize=9.5,
                                  textColor=HexColor('#1B5E3F'), alignment=TA_CENTER, leading=14))
    elements.append(stats)
    
    elements.append(Spacer(1, 1*inch))
    
    closing = Paragraph(
        "<b>Ready to Transform Your School?</b><br/>" +
        "This comprehensive guide shows you exactly how.",
        ParagraphStyle('Closing', parent=styles['Normal'], fontSize=11,
                      textColor=primary_green, alignment=TA_CENTER, leading=13,
                      fontName='Helvetica-Bold')
    )
    elements.append(closing)
    
    elements.append(PageBreak())
    
    # ===== EXECUTIVE SUMMARY PAGE =====
    elements.append(Paragraph("Executive Summary for Institution Owners", heading1_style))
    elements.append(Spacer(1, 0.15*inch))
    
    exec_text = """
    Skoolar is a complete School Management System designed to digitize every aspect of your school's 
    operations. It's not just software - it's your partner in educational excellence. With 90+ integrated 
    features, 10+ specialized portals, and proven ROI within 90 days, Skoolar is trusted by 500+ schools 
    worldwide.
    """
    elements.append(Paragraph(exec_text, body_style))
    elements.append(Spacer(1, 0.2*inch))
    
    elements.append(Paragraph("<b>Key Problems Skoolar Solves:</b>", heading2_style))
    
    problems = """
    <b>Problem 1: Operational Chaos</b> - Teachers track grades in spreadsheets, attendance manual, 
    fees scattered. Solution: Centralized system, QR attendance, automated tracking.<br/><br/>
    
    <b>Problem 2: Parent Dissatisfaction</b> - No transparency, can't track grades online, scattered 
    communication. Solution: Real-time access, online payments, official channels.<br/><br/>
    
    <b>Problem 3: Financial Uncertainty</b> - Can't track who owes what, collection takes 40+ days. 
    Solution: Automated tracking, online payments, real-time reporting.<br/><br/>
    
    <b>Problem 4: Poor Decision-Making</b> - Decisions based on incomplete data, no early warnings. 
    Solution: Automated analytics, predictive insights, data-driven decisions.
    """
    elements.append(Paragraph(problems, body_style))
    elements.append(Spacer(1, 0.2*inch))
    
    benefit_text = """
    <b>The Result:</b> 80% reduction in admin time, 40% increase in parent engagement, 
    25% improvement in student performance, 300-500% ROI in year one.
    """
    elements.append(Paragraph(benefit_text, 
                             ParagraphStyle('Benefit', parent=body_style, 
                                          textColor=accent_gold, fontName='Helvetica-Bold')))
    
    elements.append(PageBreak())
    
    # ===== STUDENT PORTAL HOW-TO =====
    elements.append(Paragraph("STUDENT PORTAL: Your Personal Academic Hub", heading1_style))
    elements.append(Spacer(1, 0.15*inch))
    
    student_intro = """
    The Student Portal gives students control over their academic journey. They can check grades, track 
    assignments, view exam schedules, and communicate with teachers - all in one place.
    """
    elements.append(Paragraph(student_intro, body_style))
    elements.append(Spacer(1, 0.15*inch))
    
    # Student features
    student_features = [
        ("Check Your Grades", "Access all exam scores instantly, view trends, see teacher feedback"),
        ("Track Attendance", "Know attendance percentage, see absence dates, view trends"),
        ("Manage Assignments", "See pending work, submit online, track grades and feedback"),
        ("View Exam Results", "Know upcoming exams, see results immediately, analyze performance"),
        ("Earn Achievements", "Earn badges for milestones, display certificates, track progress"),
        ("Message Teachers", "Ask questions directly, receive guidance, keep message history"),
    ]
    
    for feature, description in student_features:
        elements.append(Paragraph(f"<b>{feature}:</b> {description}", body_style))
        elements.append(Spacer(1, 0.08*inch))
    
    elements.append(PageBreak())
    
    # ===== PARENT PORTAL HOW-TO =====
    elements.append(Paragraph("PARENT PORTAL: Complete Visibility & Control", heading1_style))
    elements.append(Spacer(1, 0.15*inch))
    
    parent_intro = """
    The Parent Portal gives you complete visibility into your child's academic performance, attendance, 
    fees, and school communication - all accessible 24/7 from any device.
    """
    elements.append(Paragraph(parent_intro, body_style))
    elements.append(Spacer(1, 0.15*inch))
    
    parent_features = [
        ("Monitor Performance", "Real-time grades, assignment marks, exam results, trends analysis"),
        ("Track Attendance", "View attendance percentage, see absence dates, receive alerts"),
        ("Pay Fees Online", "See outstanding balance, pay with multiple methods, get instant receipts"),
        ("School Communication", "Receive announcements, RSVP events, message teachers directly"),
        ("Emergency Info", "Manage contacts, record health info, authorize pickups, update anytime"),
        ("View Reports", "Download progress reports, access report cards, print certificates"),
    ]
    
    for feature, description in parent_features:
        elements.append(Paragraph(f"<b>{feature}:</b> {description}", body_style))
        elements.append(Spacer(1, 0.08*inch))
    
    elements.append(PageBreak())
    
    # ===== TEACHER PORTAL HOW-TO =====
    elements.append(Paragraph("TEACHER PORTAL: Powerful Classroom Tools", heading1_style))
    elements.append(Spacer(1, 0.15*inch))
    
    teacher_intro = """
    The Teacher Portal gives you powerful tools to manage classes, grade students, track attendance, 
    and communicate with parents - saving 10+ hours per week while improving student outcomes.
    """
    elements.append(Paragraph(teacher_intro, body_style))
    elements.append(Spacer(1, 0.15*inch))
    
    teacher_features = [
        ("Manage Classes", "View class rosters, track performance, communicate with entire class"),
        ("Grade Student Work", "Create gradebooks, record scores, auto-calculate weighted grades"),
        ("Create Exams", "Build online exams, enable security features, auto-grade, analyze responses"),
        ("Assign Homework", "Create assignments, track submissions, grade and provide feedback"),
        ("Record Attendance", "Use QR codes or manual entry, instant recording, parent notifications"),
        ("Monitor Progress", "View student profiles, check grades, identify at-risk students, plan interventions"),
        ("Write Evaluations", "Record weekly progress, document strengths and growth areas, auto-notify parents"),
        ("Document Behavior", "Log incidents, categorize, track interventions, parent notifications automatic"),
        ("Communicate", "Message parents, schedule conferences, keep conversation history"),
        ("Professional Growth", "Track training, record certifications, document development"),
    ]
    
    for feature, description in teacher_features:
        elements.append(Paragraph(f"<b>{feature}:</b> {description}", body_style))
        elements.append(Spacer(1, 0.07*inch))
    
    elements.append(PageBreak())
    
    # ===== DIRECTOR/PRINCIPAL PORTAL =====
    elements.append(Paragraph("DIRECTOR/PRINCIPAL PORTAL: School Command Center", heading1_style))
    elements.append(Spacer(1, 0.15*inch))
    
    director_intro = """
    The Director Portal is your command center for running the school. Monitor performance, manage finances, 
    oversee academics, and make data-driven decisions - all from one powerful dashboard.
    """
    elements.append(Paragraph(director_intro, body_style))
    elements.append(Spacer(1, 0.15*inch))
    
    director_features = [
        ("Dashboard", "Real-time school metrics, KPIs, alerts, performance snapshot"),
        ("Academic Monitoring", "School-wide performance, class comparisons, teacher effectiveness"),
        ("Exam Management", "Create exams, approve questions, monitor progress, analyze results"),
        ("User Management", "Add/remove staff, assign roles, configure permissions, monitor activity"),
        ("Settings", "School information, academic calendar, classes, subjects, policies"),
        ("Fee Management", "Define structures, set schedules, configure by class, manage scholarships"),
        ("Fee Tracking", "Real-time payment dashboard, outstanding balances, collection trends"),
        ("Announcements", "Broadcast to school, target groups, schedule, track read receipts"),
        ("Events", "Create events, manage RSVPs, track attendance, send reminders"),
        ("Reports", "Attendance, performance, fee collection, staff, export capabilities"),
        ("Audit Trail", "Track all system activity, user actions, maintain compliance"),
    ]
    
    for i, (feature, description) in enumerate(director_features):
        elements.append(Paragraph(f"<b>{feature}:</b> {description}", body_style))
        if i < len(director_features) - 1:
            elements.append(Spacer(1, 0.07*inch))
    
    elements.append(PageBreak())
    
    # ===== ACCOUNTANT & LIBRARIAN PORTALS =====
    elements.append(Paragraph("ACCOUNTANT PORTAL: Financial Control", heading1_style))
    elements.append(Spacer(1, 0.1*inch))
    
    accountant_features = """
    <b>Record Payments:</b> Cash, online, transfers, checks<br/>
    <b>Generate Reports:</b> Monthly revenue, fee-wise, class-wise analysis<br/>
    <b>Manage Arrears:</b> Outstanding balances, aging analysis, reminders<br/>
    <b>Reconciliation:</b> Bank matching, account balancing, discrepancy detection<br/>
    <b>Expense Tracking:</b> Record expenses, category, approval workflow, reports<br/>
    """
    elements.append(Paragraph(accountant_features, body_style))
    
    elements.append(Spacer(1, 0.2*inch))
    elements.append(Paragraph("LIBRARIAN PORTAL: Library Management", heading1_style))
    elements.append(Spacer(1, 0.1*inch))
    
    librarian_features = """
    <b>Build Inventory:</b> Add books, scan ISBN, categorize, track quantities<br/>
    <b>Check Out Books:</b> Scan student and book, automatic due date<br/>
    <b>Check In Books:</b> Scan barcode, verify date, calculate fines<br/>
    <b>Manage Fines:</b> Track overdue, collect payments, waivers<br/>
    <b>Analytics:</b> Popular books, reading trends, usage reports<br/>
    """
    elements.append(Paragraph(librarian_features, body_style))
    
    elements.append(PageBreak())
    
    # ===== IMPLEMENTATION & ROI =====
    elements.append(Paragraph("4-Week Implementation & ROI", heading1_style))
    elements.append(Spacer(1, 0.15*inch))
    
    impl_text = """
    <b>Week 1:</b> Planning, school configuration, settings<br/>
    <b>Week 2:</b> Data migration, staff training, hands-on practice<br/>
    <b>Week 3:</b> Soft launch with one class, feedback collection<br/>
    <b>Week 4:</b> Full rollout, optimization, staff confident
    """
    elements.append(Paragraph(impl_text, body_style))
    elements.append(Spacer(1, 0.2*inch))
    
    roi_text = """
    <b>Time Savings:</b> 500+ hours per month (Administrative, Teacher, Finance)<br/>
    <b>Value:</b> $8,000-$15,000 per month<br/><br/>
    
    <b>Revenue Improvement:</b> 12-18% better fee collection<br/>
    <b>Value:</b> $5,000-$20,000 per month<br/><br/>
    
    <b>Cost Reduction:</b> No more tool subscriptions, reduced paper<br/>
    <b>Value:</b> $5,000-$10,000 per month<br/><br/>
    
    <b>Total First-Year ROI: 300-500%</b>
    """
    elements.append(Paragraph(roi_text, 
                             ParagraphStyle('ROI', parent=body_style, 
                                          textColor=accent_gold, fontName='Helvetica-Bold')))
    
    elements.append(PageBreak())
    
    # ===== PRICING & CONCLUSION =====
    elements.append(Paragraph("Transparent Pricing & Getting Started", heading1_style))
    elements.append(Spacer(1, 0.15*inch))
    
    pricing_text = """
    <b>BASIC PLAN:</b> Up to 500 students, 50 teachers, $99/month<br/>
    <b>PROFESSIONAL PLAN:</b> Up to 2,000 students, 200 teachers, $299/month<br/>
    <b>ENTERPRISE PLAN:</b> Unlimited users, custom features, custom pricing<br/><br/>
    
    All plans include: Cloud hosting, backups, 99.9% uptime, all core features, 
    training, support, monthly updates.
    """
    elements.append(Paragraph(pricing_text, body_style))
    
    elements.append(Spacer(1, 0.2*inch))
    
    next_steps = """
    <b>3 Simple Steps to Transformation:</b><br/>
    1. Schedule your demo (15 minutes)<br/>
    2. Start free trial (30 days)<br/>
    3. Launch your school transformation (4 weeks)<br/><br/>
    """
    elements.append(Paragraph(next_steps, body_style))
    
    elements.append(Spacer(1, 0.2*inch))
    
    contact = """
    <b>Contact Skoolar Technology LTD</b><br/>
    Email: hello@skoolar.io<br/>
    Phone: +1 (555) SKOOLAR<br/>
    Website: www.skoolar.io<br/>
    Support: support@skoolar.io<br/>
    Location: Odiolowo Street, Ijebu Ode, Ogun State, Nigeria<br/><br/>
    
    <b>Your Partner in Educational Excellence</b>
    """
    elements.append(Paragraph(contact, 
                             ParagraphStyle('Contact', parent=body_style, 
                                          textColor=primary_green, fontName='Helvetica-Bold')))
    
    # Build PDF
    doc.build(elements)
    
    pdf_size = pdf_file.stat().st_size / (1024 * 1024)
    
    print(f"\n✓ PDF GENERATED SUCCESSFULLY!")
    print(f"  File: SKOOLAR_COMPREHENSIVE_MARKETING.pdf")
    print(f"  Size: {pdf_size:.2f} MB")
    print(f"  Location: {pdf_file}")
    print(f"\n✓ BRANDING APPLIED:")
    print(f"  - Skoolar Green (#1B5E3F)")
    print(f"  - Accent Gold (#D4A574)")
    print(f"  - Professional formatting")
    print(f"\n✓ CONTENT INCLUDED:")
    print(f"  - Executive Summary")
    print(f"  - Student Portal How-To")
    print(f"  - Parent Portal How-To")
    print(f"  - Teacher Portal How-To")
    print(f"  - Director/Principal Portal How-To")
    print(f"  - Accountant Portal How-To")
    print(f"  - Librarian Portal How-To")
    print(f"  - Implementation Timeline")
    print(f"  - ROI Analysis")
    print(f"  - Pricing & Plans")
    print(f"  - Contact Information")
    print(f"\n✓ READY TO DISTRIBUTE!")

if __name__ == "__main__":
    try:
        create_comprehensive_pdf()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

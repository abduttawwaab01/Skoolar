#!/usr/bin/env python3
"""
Convert Skoolar Marketing to Professional PDF
Using reportlab - pure Python, no external dependencies
"""

import os
import sys
from pathlib import Path

def create_branded_pdf():
    """Create a beautifully branded Skoolar marketing PDF"""
    
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
        from reportlab.lib.colors import HexColor
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    except ImportError:
        print("Installing reportlab...")
        os.system(f"{sys.executable} -m pip install reportlab -q")
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
        from reportlab.lib.colors import HexColor
        from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    pdf_file = project_dir / "SKOOLAR_MARKETING_BROCHURE.pdf"
    
    print(f"Creating branded PDF...")
    print(f"Output: {pdf_file}")
    
    # Create PDF document
    doc = SimpleDocTemplate(
        str(pdf_file),
        pagesize=A4,
        rightMargin=30,
        leftMargin=30,
        topMargin=40,
        bottomMargin=30
    )
    
    # Container for PDF elements
    elements = []
    
    # Define styles with Skoolar branding
    styles = getSampleStyleSheet()
    
    # Title style
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=28,
        textColor=HexColor('#1B5E3F'),
        spaceAfter=6,
        alignment=TA_CENTER,
        fontName='Helvetica-Bold'
    )
    
    # Subtitle style
    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Normal'],
        fontSize=14,
        textColor=HexColor('#D4A574'),
        spaceAfter=12,
        alignment=TA_CENTER,
        fontName='Helvetica-Oblique'
    )
    
    # Section heading style
    heading_style = ParagraphStyle(
        'CustomHeading',
        parent=styles['Heading2'],
        fontSize=16,
        textColor=HexColor('#1B5E3F'),
        spaceAfter=8,
        spaceBefore=12,
        fontName='Helvetica-Bold',
        borderPadding=6,
        borderColor=HexColor('#D4A574'),
        borderWidth=0
    )
    
    # Body text style
    body_style = ParagraphStyle(
        'CustomBody',
        parent=styles['BodyText'],
        fontSize=10,
        textColor=HexColor('#333333'),
        spaceAfter=8,
        alignment=TA_JUSTIFY,
        leading=14
    )
    
    # ===== PAGE 1: COVER =====
    elements.append(Spacer(1, 1*inch))
    
    # Header with branding
    header = Paragraph("<b>SKOOLAR TECHNOLOGY LTD</b>", subtitle_style)
    elements.append(header)
    
    tagline = Paragraph("<i>Bringing digital solutions to Educational system</i>", 
                       ParagraphStyle('Tagline', parent=styles['Normal'], fontSize=11, 
                                    textColor=HexColor('#666666'), alignment=TA_CENTER))
    elements.append(tagline)
    elements.append(Spacer(1, 0.5*inch))
    
    # Main title
    title = Paragraph("Transform Your School Into a Digital-First Institution", title_style)
    elements.append(title)
    elements.append(Spacer(1, 0.2*inch))
    
    # Tagline
    subtitle = Paragraph("The All-in-One School Management System that Schools Love", subtitle_style)
    elements.append(subtitle)
    elements.append(Spacer(1, 0.5*inch))
    
    # Key stats
    stats_text = """
    <b>90+ Database Models</b> | <b>10+ User Roles</b> | <b>Multi-tenant Architecture</b><br/>
    <b>Real-time Analytics</b> | <b>Mobile-First Design</b> | <b>Enterprise Security</b>
    """
    stats = Paragraph(stats_text, 
                     ParagraphStyle('Stats', parent=styles['Normal'], fontSize=10,
                                  textColor=HexColor('#1B5E3F'), alignment=TA_CENTER, 
                                  leading=14))
    elements.append(stats)
    elements.append(Spacer(1, 1*inch))
    
    footer_text = """
    <b>Ready to revolutionize your school's operations?</b><br/>
    This document contains everything you need to know about Skoolar.
    """
    footer = Paragraph(footer_text, 
                      ParagraphStyle('Footer', parent=styles['Normal'], fontSize=10,
                                   textColor=HexColor('#666666'), alignment=TA_CENTER))
    elements.append(footer)
    
    elements.append(PageBreak())
    
    # ===== PAGE 2: EXECUTIVE OVERVIEW =====
    elements.append(Paragraph("Executive Overview", heading_style))
    elements.append(Spacer(1, 0.2*inch))
    
    overview_text = """
    Skoolar is a comprehensive, cloud-based School Management System (SMS) designed specifically 
    for K-12 educational institutions. Built with modern cloud architecture and enterprise-grade security, 
    Skoolar digitizes every aspect of school operations from academics to administration in a single, 
    unified platform.
    """
    elements.append(Paragraph(overview_text, body_style))
    elements.append(Spacer(1, 0.2*inch))
    
    elements.append(Paragraph("<b>The Problem We Solve</b>", heading_style))
    elements.append(Spacer(1, 0.1*inch))
    
    problems = """
    Schools face multiple challenges: Fragmented systems with spreadsheets and disconnected platforms, 
    significant administrative overhead with manual data entry, lack of transparency with uninformed parents, 
    and data security concerns with unprotected records. Skoolar solves all of these with a single unified 
    platform, automated workflows, real-time transparency, enterprise-grade security, and instant analytics.
    """
    elements.append(Paragraph(problems, body_style))
    elements.append(Spacer(1, 0.3*inch))
    
    # ===== PAGE 3: CORE FEATURES =====
    elements.append(PageBreak())
    elements.append(Paragraph("Core Features", heading_style))
    elements.append(Spacer(1, 0.2*inch))
    
    features_content = """
    <b>1. Academic Management</b><br/>
    Class organization, subject management, comprehensive exam system with multiple question types, 
    instant grading, attendance tracking with QR codes, homework management, and timetable creation.<br/><br/>
    
    <b>2. Student Portal</b><br/>
    Real-time grades, attendance tracking, exam schedules, homework submission, achievement badges, 
    messaging system, and leaderboards for motivation.<br/><br/>
    
    <b>3. Parent Portal</b><br/>
    Complete visibility into child performance, fee payment status, school communications, event RSVPs, 
    and direct teacher messaging.<br/><br/>
    
    <b>4. Teacher Dashboard</b><br/>
    Class management, grading hub, attendance tools, assignment creation, student performance tracking, 
    behavior monitoring, and professional development tracking.<br/><br/>
    
    <b>5. Financial Management</b><br/>
    Complete fee structure configuration, multiple payment methods, payment tracking with auto-reminders, 
    financial reporting, and expense management.
    """
    elements.append(Paragraph(features_content, body_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # ===== PAGE 4: KEY BENEFITS =====
    elements.append(PageBreak())
    elements.append(Paragraph("Key Benefits", heading_style))
    elements.append(Spacer(1, 0.2*inch))
    
    benefits_text = """
    <b>For Students:</b> Personalized learning experience, real-time transparency about grades and progress, 
    mobile-first access anywhere, and motivational achievement system.<br/><br/>
    
    <b>For Parents:</b> Complete transparency on child performance, easy fee payment online, direct 
    communication with teachers, and instant updates on school events.<br/><br/>
    
    <b>For Teachers:</b> Time-saving automated grading and attendance, real-time student performance insights, 
    better student engagement tools, and professional development tracking.<br/><br/>
    
    <b>For Administration:</b> 80 percent reduction in administrative overhead, financial control with 
    payment tracking, data-driven decision making with analytics, and complete audit trails for compliance.
    """
    elements.append(Paragraph(benefits_text, body_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # ===== PAGE 5: SUCCESS METRICS & PRICING =====
    elements.append(PageBreak())
    elements.append(Paragraph("Impact & Pricing", heading_style))
    elements.append(Spacer(1, 0.2*inch))
    
    metrics_text = """
    <b>Proven Impact:</b><br/>
    Schools report 80 percent reduction in administrative overhead, 60 percent time savings in report generation, 
    95 percent mobile usage, 40 percent increase in parent engagement, 25 percent improvement in student performance, 
    and 98 percent would recommend to other parents.<br/><br/>
    
    <b>Flexible Pricing Plans:</b><br/>
    Basic Plan: Up to 500 students, 50 teachers, core features, starting at $99/month<br/>
    Professional Plan: Up to 2000 students, 200 teachers, advanced analytics, starting at $299/month<br/>
    Enterprise Plan: Unlimited users, all features, custom integrations, dedicated support, custom pricing<br/><br/>
    
    All plans include cloud hosting, automatic backups, 99.9% uptime guarantee, all core features, 
    user training, and monthly updates.
    """
    elements.append(Paragraph(metrics_text, body_style))
    elements.append(Spacer(1, 0.2*inch))
    
    # ===== PAGE 6: SECURITY & GETTING STARTED =====
    elements.append(PageBreak())
    elements.append(Paragraph("Security & Getting Started", heading_style))
    elements.append(Spacer(1, 0.2*inch))
    
    security_text = """
    <b>Enterprise-Grade Security:</b><br/>
    End-to-end encryption, AES-256 encryption at rest, TLS 1.3 for data in transit, multi-factor authentication, 
    role-based access control, complete audit trail, GDPR compliance, and regular security audits.<br/><br/>
    
    <b>Technology Stack:</b><br/>
    Built with Next.js 16, React 19, TypeScript, PostgreSQL, Vercel cloud infrastructure, and modern 
    web technologies for reliability and performance.<br/><br/>
    
    <b>Getting Started:</b><br/>
    1. Start your free 30-day trial with no credit card required<br/>
    2. Request a personalized demo from our education specialists<br/>
    3. Our team handles implementation, data migration, and training<br/>
    4. Go live in just 4 weeks with full support<br/><br/>
    
    <b>Contact Us:</b><br/>
    Email: hello@skoolar.io | Website: www.skoolar.io | Support: support@skoolar.io<br/>
    Address: Odiolowo Street, Ijebu Ode, Ogun State, Nigeria
    """
    elements.append(Paragraph(security_text, body_style))
    elements.append(Spacer(1, 0.5*inch))
    
    # Final message
    closing = Paragraph(
        "<b>Skoolar: Where Education Meets Innovation</b><br/>" +
        "Transform your school today. Start your free trial now.",
        ParagraphStyle('Closing', parent=styles['Normal'], fontSize=11,
                      textColor=HexColor('#1B5E3F'), alignment=TA_CENTER,
                      fontName='Helvetica-Bold')
    )
    elements.append(closing)
    
    # Copyright
    elements.append(Spacer(1, 0.3*inch))
    copyright_text = Paragraph(
        "Copyright 2025 Skoolar Technology LTD | Bringing Education into the Digital Age",
        ParagraphStyle('Copyright', parent=styles['Normal'], fontSize=8,
                      textColor=HexColor('#999999'), alignment=TA_CENTER)
    )
    elements.append(copyright_text)
    
    # Build PDF
    doc.build(elements)
    
    # Get file size
    pdf_size = pdf_file.stat().st_size / (1024 * 1024)
    
    print(f"\nSUCCESS! PDF Generated:")
    print(f"  File size: {pdf_size:.2f} MB")
    print(f"  Location: {pdf_file}")
    print(f"\nBranding Applied:")
    print(f"  - Skoolar Green (#1B5E3F)")
    print(f"  - Accent Gold (#D4A574)")
    print(f"  - Professional Letterhead Style")
    print(f"  - 6 Content Pages")
    print(f"  - All Features & Benefits")
    print(f"  - Security Information")
    print(f"  - Pricing Models")
    print(f"  - Contact Details")
    print(f"\nThe PDF is ready to share with schools!")

if __name__ == "__main__":
    try:
        create_branded_pdf()
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

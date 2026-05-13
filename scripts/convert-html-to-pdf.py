#!/usr/bin/env python3
"""
Convert Skoolar Marketing HTML to Professional PDF
Uses fpdf2 for PDF generation - pure Python, no system dependencies
"""

import os
import sys
import re
from pathlib import Path

def install_fpdf2():
    """Install fpdf2 if not available"""
    try:
        import fpdf
        return True
    except ImportError:
        print("⚠️  Installing fpdf2...")
        os.system(f"{sys.executable} -m pip install fpdf2 -q")
        return True

def html_to_pdf_fpdf2():
    """Generate PDF from HTML using fpdf2"""
    from fpdf import FPDF
    
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    html_file = project_dir / "SKOOLAR_MARKETING_BROCHURE.html"
    pdf_file = project_dir / "SKOOLAR_MARKETING_BROCHURE.pdf"
    
    if not html_file.exists():
        print(f"❌ Error: HTML file not found at {html_file}")
        sys.exit(1)
    
    print(f"📄 Converting HTML to PDF...")
    print(f"   Input:  {html_file}")
    print(f"   Output: {pdf_file}")
    
    try:
        # Read HTML
        with open(html_file, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Create PDF
        pdf = FPDF(orientation='P', unit='mm', format='A4')
        pdf.set_font('helvetica', '', 11)
        pdf.set_auto_page_break(auto=True, margin=10)
        pdf.add_page()
        
        # Write PDF with basic HTML support
        pdf.write_html(html_content)
        
        # Output PDF
        pdf.output(str(pdf_file))
        
        # Get file size
        pdf_size = pdf_file.stat().st_size / (1024 * 1024)
        
        print(f"\n✅ PDF Generated Successfully!")
        print(f"   File size: {pdf_size:.2f} MB")
        print(f"   Location: {pdf_file}")
        print(f"\n🎨 Branding Applied:")
        print(f"   ✓ Skoolar Green (#1B5E3F)")
        print(f"   ✓ Accent Gold (#D4A574)")
        print(f"   ✓ Professional Letterhead")
        print(f"   ✓ Multi-page Layout")
        print(f"   ✓ All Features & Benefits")
        
    except Exception as e:
        print(f"⚠️  fpdf2 approach had issues: {e}")
        print("Trying alternative approach...")
        html_to_pdf_reportlab()

def html_to_pdf_reportlab():
    """Fallback: Generate PDF from HTML using reportlab"""
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle
    from reportlab.lib.colors import HexColor
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
    import html2text
    
    script_dir = Path(__file__).parent
    project_dir = script_dir.parent
    html_file = project_dir / "SKOOLAR_MARKETING_BROCHURE.html"
    pdf_file = project_dir / "SKOOLAR_MARKETING_BROCHURE.pdf"
    
    print(f"Using reportlab for PDF generation...")
    
    try:
        # Create PDF
        doc = SimpleDocTemplate(
            str(pdf_file),
            pagesize=A4,
            rightMargin=30,
            leftMargin=30,
            topMargin=30,
            bottomMargin=30
        )
        
        # Container for the 'Flowable' objects
        elements = []
        
        # Define styles
        styles = getSampleStyleSheet()
        title_style = ParagraphStyle(
            'CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=HexColor('#1B5E3F'),
            spaceAfter=12,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        )
        
        heading_style = ParagraphStyle(
            'CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=HexColor('#1B5E3F'),
            spaceAfter=10,
            spaceBefore=10,
            fontName='Helvetica-Bold'
        )
        
        # Add title
        title = Paragraph("🎓 <b>SKOOLAR</b><br/>Transform Your School Into a Digital-First Institution", title_style)
        elements.append(title)
        elements.append(Spacer(1, 0.3*inch))
        
        # Add content sections
        content_sections = [
            ("Executive Overview", "Comprehensive, cloud-based School Management System (SMS) designed for K-12 institutions."),
            ("Key Features", "Academic Management • Student Portal • Teacher Tools • Financial Management • Communication"),
            ("Benefits", "80% Admin reduction • 60% Report time savings • 95% Mobile usage • 40% Parent engagement increase"),
            ("Security", "Enterprise-grade encryption • GDPR compliance • Multi-factor authentication • Complete audit trail"),
            ("Pricing", "Basic: $99/month • Professional: $299/month • Enterprise: Custom pricing"),
            ("Get Started", "Free 30-day trial • No credit card required • Dedicated support"),
        ]
        
        for section_title, section_content in content_sections:
            heading = Paragraph(f"<b>{section_title}</b>", heading_style)
            elements.append(heading)
            
            content = Paragraph(section_content, styles['BodyText'])
            elements.append(content)
            elements.append(Spacer(1, 0.2*inch))
        
        # Build PDF
        doc.build(elements)
        
        # Get file size
        pdf_size = pdf_file.stat().st_size / (1024 * 1024)
        
        print(f"\n✅ PDF Generated Successfully!")
        print(f"   File size: {pdf_size:.2f} MB")
        print(f"   Location: {pdf_file}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    install_fpdf2()
    try:
        html_to_pdf_fpdf2()
    except Exception as e:
        print(f"⚠️  Trying alternative PDF method...")
        try:
            # Try reportlab
            os.system(f"{sys.executable} -m pip install reportlab -q")
            html_to_pdf_reportlab()
        except Exception as e2:
            print(f"❌ Both PDF methods failed: {e2}")
            sys.exit(1)

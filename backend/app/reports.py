from io import BytesIO
from datetime import datetime
from flask import Blueprint, send_file, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.models import CarbonRecord, User, Goal, Achievement

reports_bp = Blueprint('reports', __name__)

@reports_bp.route('/download', methods=['GET'])
@jwt_required()
def download_pdf_report():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    records = CarbonRecord.query.filter_by(user_id=user_id).all()
    goals = Goal.query.filter_by(user_id=user_id).all()
    achievements = Achievement.query.filter_by(user_id=user_id).all()
    
    # Calculate carbon footprint summaries
    t_sum = sum(r.transport_emissions for r in records)
    e_sum = sum(r.home_emissions for r in records)
    f_sum = sum(r.food_emissions for r in records)
    w_sum = sum(r.waste_emissions for r in records)
    total_co2 = t_sum + e_sum + f_sum + w_sum
    count = len(records)
    avg_co2 = (total_co2 / count) if count > 0 else 0
    
    # Heuristics for scores
    carbon_score = max(0, min(100, int(100 - (avg_co2 * 3.3)))) if count > 0 else 100
    
    # Write PDF in memory
    buffer = BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=40, leftMargin=40, topMargin=40, bottomMargin=40
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        textColor=colors.HexColor('#0F5132'), # Deep green
        spaceAfter=15
    )
    
    section_title = ParagraphStyle(
        'SectionTitle',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=16,
        textColor=colors.HexColor('#198754'), # Mid green
        spaceBefore=15,
        spaceAfter=10
    )
    
    body_style = ParagraphStyle(
        'DocBody',
        parent=styles['BodyText'],
        fontName='Helvetica',
        fontSize=10,
        textColor=colors.HexColor('#212529'),
        spaceBefore=5,
        spaceAfter=5
    )
    
    bold_body_style = ParagraphStyle(
        'DocBoldBody',
        parent=styles['BodyText'],
        fontName='Helvetica-Bold',
        fontSize=10,
        textColor=colors.HexColor('#212529')
    )

    story = []
    
    # Title & Header
    story.append(Paragraph("EcoTrack AI - Sustainability Report", title_style))
    story.append(Paragraph(f"Generated on: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", body_style))
    story.append(Paragraph(f"User: {user.username} ({user.email})", body_style))
    story.append(Paragraph(f"Eco Level: {user.level} | Total Badges: {len(achievements)}", body_style))
    story.append(Spacer(1, 15))
    
    # Summary Section
    story.append(Paragraph("1. Carbon Footprint Summary", section_title))
    story.append(Paragraph(
        f"This section details your total logged emissions across transportation, home energy, "
        f"food habits, and waste management. You have logged a total of {count} daily records.",
        body_style
    ))
    story.append(Spacer(1, 10))
    
    # Table of emissions
    data = [
        [Paragraph("Category", bold_body_style), Paragraph("Total Emissions (kg CO2)", bold_body_style)],
        [Paragraph("Transportation", body_style), Paragraph(f"{t_sum:.2f}", body_style)],
        [Paragraph("Home Energy", body_style), Paragraph(f"{e_sum:.2f}", body_style)],
        [Paragraph("Food Choices", body_style), Paragraph(f"{f_sum:.2f}", body_style)],
        [Paragraph("Waste Management", body_style), Paragraph(f"{w_sum:.2f}", body_style)],
        [Paragraph("Grand Total", bold_body_style), Paragraph(f"{total_co2:.2f}", bold_body_style)],
        [Paragraph("Daily Average", bold_body_style), Paragraph(f"{avg_co2:.2f}", bold_body_style)]
    ]
    
    table = Table(data, colWidths=[200, 200])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (1, 0), colors.HexColor('#E8F5E9')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#C8E6C9')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(table)
    story.append(Spacer(1, 15))
    
    # Metrics Score section
    story.append(Paragraph("2. Sustainability Indexes", section_title))
    score_data = [
        [Paragraph("Metric", bold_body_style), Paragraph("Score", bold_body_style), Paragraph("Rating", bold_body_style)],
        [Paragraph("Carbon Score", body_style), Paragraph(str(carbon_score), body_style), Paragraph("Excellent" if carbon_score > 80 else ("Good" if carbon_score > 50 else "Needs Improvement"), body_style)],
        [Paragraph("Green Points Balance", body_style), Paragraph(str(user.green_points), body_style), Paragraph("-", body_style)]
    ]
    score_table = Table(score_data, colWidths=[150, 100, 150])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (2, 0), colors.HexColor('#E8F5E9')),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#C8E6C9')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 15))

    # Active Goals Section
    story.append(Paragraph("3. Active Reduction Goals", section_title))
    if goals:
        goals_data = [[Paragraph("Category", bold_body_style), Paragraph("Target %", bold_body_style), Paragraph("Status", bold_body_style)]]
        for goal in goals:
            goals_data.append([
                Paragraph(goal.category.capitalize(), body_style),
                Paragraph(f"{goal.target_reduction_pct}%", body_style),
                Paragraph(goal.status, body_style)
            ])
        goals_table = Table(goals_data, colWidths=[150, 120, 130])
        goals_table.setStyle(TableStyle([
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#C8E6C9')),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
            ('TOPPADDING', (0, 0), (-1, -1), 6),
        ]))
        story.append(goals_table)
    else:
        story.append(Paragraph("You do not have any active goals set yet. Set goals on your EcoTrack AI dashboard to start saving carbon!", body_style))
        
    story.append(Spacer(1, 25))
    story.append(Paragraph("EcoTrack AI | Keep tracking and make every day greener!", bold_body_style))

    # Build PDF
    doc.build(story)
    
    buffer.seek(0)
    return send_file(
        buffer,
        as_attachment=True,
        download_name=f"ecotrack_report_{datetime.now().strftime('%Y%m%d')}.pdf",
        mimetype='application/pdf'
    )

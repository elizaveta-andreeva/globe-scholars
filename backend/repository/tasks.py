from celery import shared_task
from django.core.files.base import ContentFile
import subprocess
import os
import time

from .models import ScholarlyWork


@shared_task(bind=True)
def convert_docx_to_pdf(self, work_id):
    """
    Convert DOCX file to PDF using LibreOffice
    Updates conversion status and progress
    """
    try:
        work = ScholarlyWork.objects.get(id=work_id)
        
        # Update status to processing
        work.conversion_status = 'processing'
        work.conversion_progress = 0
        work.save()
        
        # Get file paths
        docx_path = work.file.path
        output_dir = os.path.dirname(docx_path)
        
        # Progress: 25% - Starting conversion
        work.conversion_progress = 25
        work.save()
        
        # Run LibreOffice conversion
        result = subprocess.run([
            'libreoffice',
            '--headless',
            '--convert-to', 'pdf',
            '--outdir', output_dir,
            docx_path
        ], capture_output=True, text=True, timeout=300)
        
        # Progress: 75% - Conversion complete
        work.conversion_progress = 75
        work.save()
        
        if result.returncode != 0:
            raise Exception(f"LibreOffice conversion failed: {result.stderr}")
        
        # Find generated PDF
        pdf_filename = os.path.splitext(os.path.basename(docx_path))[0] + '.pdf'
        pdf_path = os.path.join(output_dir, pdf_filename)
        
        if not os.path.exists(pdf_path):
            raise Exception(f"PDF file not found at {pdf_path}")
        
        # Save PDF to model
        with open(pdf_path, 'rb') as pdf_file:
            work.converted_pdf.save(
                pdf_filename,
                ContentFile(pdf_file.read()),
                save=False
            )
        
        # Clean up temporary PDF (it's now in media/converted_pdfs/)
        os.remove(pdf_path)
        
        # Progress: 100% - Complete
        work.conversion_status = 'completed'
        work.conversion_progress = 100
        work.save()
        
        return f"Successfully converted work {work_id}"
        
    except ScholarlyWork.DoesNotExist:
        return f"ScholarlyWork {work_id} not found"
        
    except subprocess.TimeoutExpired:
        work.conversion_status = 'failed'
        work.save()
        return f"Conversion timeout for work {work_id}"
        
    except Exception as e:
        work.conversion_status = 'failed'
        work.save()
        return f"Conversion failed for work {work_id}: {str(e)}"
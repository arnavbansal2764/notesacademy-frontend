import jsPDF from 'jspdf';

interface MCQForPDF {
  question: string;
  options: string[];
  correct_answer: string;
  explanation?: string;
}

export const generateMCQPDF = (
  title: string,
  mcqs: MCQForPDF[],
  includeAnswers: boolean = true
): jsPDF => {
  const doc = new jsPDF();
  let yPosition = 25;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 5;
  const pageWidth = doc.internal.pageSize.width;

  // Helper function to add new page if needed
  const checkPageBreak = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = 25;
    }
  };

  // Helper function for text
  const addText = (
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    fontSize: number = 11,
    fontWeight: 'normal' | 'bold' = 'normal'
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontWeight);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * lineHeight;
  };

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(title, margin, yPosition);
  yPosition += 10;

  // Info line
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Questions: ${mcqs.length}`, margin, yPosition);
  yPosition += 15;

  // Instructions
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('Instructions: Choose the best answer for each question.', margin, yPosition);
  yPosition += 15;

  // Questions
  mcqs.forEach((mcq, index) => {
    checkPageBreak(35); // Reduced space check

    // Question
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    const questionText = `${index + 1}. ${mcq.question}`;
    const questionHeight = addText(questionText, margin, yPosition, pageWidth - 2 * margin, 11, 'bold');
    yPosition += questionHeight + 6;

    // Options - Fixed the duplicate letter issue
    doc.setFont('helvetica', 'normal');
    mcq.options.forEach((option, optionIndex) => {
      checkPageBreak(8);
      
      const optionLetter = String.fromCharCode(65 + optionIndex); // A, B, C, D
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      
      // Just the option letter and text, no duplication
      const optionText = `   ${optionLetter}. ${option}`;
      const optionHeight = addText(optionText, margin, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += Math.max(optionHeight, 5) + 2;
    });

    yPosition += 8; // Reduced space between questions
  });

  // Answer Key on next page
  if (includeAnswers) {
    // Always start answer key on new page
    doc.addPage();
    yPosition = 25;
    
    // Answer key title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('ANSWER KEY', margin, yPosition);
    yPosition += 15;

    // Answers in compact grid
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const answersPerRow = 8; // More answers per row
    const columnWidth = (pageWidth - 2 * margin) / answersPerRow;
    
    let currentRow = 0;
    
    mcqs.forEach((mcq, index) => {
      const col = index % answersPerRow;
      
      if (col === 0 && index > 0) {
        currentRow++;
      }
      
      if (col === 0) {
        checkPageBreak(10);
      }
      
      const xPos = margin + col * columnWidth;
      const currentY = yPosition + currentRow * 10;
      
      doc.setTextColor(0, 0, 0);
      doc.text(`${index + 1}. ${mcq.correct_answer}`, xPos, currentY);
    });
    
    yPosition += (currentRow + 1) * 10 + 15;
    
    // Simple footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
  }

  // Simple page numbers at bottom
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `${i}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
  }

  return doc;
};

export const downloadMCQPDF = (
  title: string,
  mcqs: MCQForPDF[],
  filename?: string
) => {
  const pdf = generateMCQPDF(title, mcqs, true);
  const pdfFilename = filename || `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_mcqs.pdf`;
  pdf.save(pdfFilename);
};

interface SubjectiveForPDF {
  question: string;
  answer: string;
}

export const generateSubjectivePDF = (
  title: string,
  questions: SubjectiveForPDF[],
  includeAnswers: boolean = true
): jsPDF => {
  const doc = new jsPDF();
  let yPosition = 25;
  const pageHeight = doc.internal.pageSize.height;
  const margin = 20;
  const lineHeight = 5;
  const pageWidth = doc.internal.pageSize.width;

  // Helper function to add new page if needed
  const checkPageBreak = (neededSpace: number) => {
    if (yPosition + neededSpace > pageHeight - 30) {
      doc.addPage();
      yPosition = 25;
    }
  };

  // Helper function for text
  const addText = (
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    fontSize: number = 11,
    fontWeight: 'normal' | 'bold' = 'normal'
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontWeight);
    doc.setTextColor(0, 0, 0);
    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y);
    return lines.length * lineHeight;
  };

  // Title
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text(title, margin, yPosition);
  yPosition += 10;

  // Info line
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(`Questions: ${questions.length} | Date: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 15;

  // Instructions
  doc.setFontSize(10);
  doc.setTextColor(60, 60, 60);
  doc.text('Instructions: Answer the following questions in detail. Use additional paper if needed.', margin, yPosition);
  yPosition += 15;

  // Questions
  questions.forEach((question, index) => {
    checkPageBreak(60);

    // Question
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    
    const questionText = `${index + 1}. ${question.question}`;
    const questionHeight = addText(questionText, margin, yPosition, pageWidth - 2 * margin, 11, 'bold');
    yPosition += questionHeight + 10;

    // Answer space lines
    if (!includeAnswers) {
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      for (let i = 0; i < 8; i++) {
        checkPageBreak(8);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      }
    }

    yPosition += 15; // Space between questions
  });

  // Answer Key on next page
  if (includeAnswers) {
    doc.addPage();
    yPosition = 25;
    
    // Answer key title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('ANSWER KEY', margin, yPosition);
    yPosition += 15;

    // Answers
    questions.forEach((question, index) => {
      checkPageBreak(40);

      // Question number and text
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(0, 0, 0);
      
      const questionText = `${index + 1}. ${question.question}`;
      const questionHeight = addText(questionText, margin, yPosition, pageWidth - 2 * margin, 11, 'bold');
      yPosition += questionHeight + 8;

      // Answer
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(50, 50, 50);
      const answerHeight = addText(question.answer, margin + 5, yPosition, pageWidth - 2 * margin - 10, 10);
      yPosition += answerHeight + 15;

      // Separator line
      if (index < questions.length - 1) {
        doc.setDrawColor(220, 220, 220);
        doc.setLineWidth(0.3);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 10;
      }
    });
    
    yPosition += 15;
    
    // Simple footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('Generated by Notes Academy', margin, yPosition);
  }

  // Simple page numbers at bottom
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `${i}`,
      pageWidth / 2,
      pageHeight - 15,
      { align: 'center' }
    );
  }

  return doc;
};

export const downloadSubjectivePDF = (
  title: string,
  questions: SubjectiveForPDF[],
  filename?: string,
  includeAnswers: boolean = false
) => {
  const pdf = generateSubjectivePDF(title, questions, includeAnswers);
  const suffix = includeAnswers ? '_with_answers' : '_questions_only';
  const pdfFilename = filename || `${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_subjective${suffix}.pdf`;
  pdf.save(pdfFilename);
};

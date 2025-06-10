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

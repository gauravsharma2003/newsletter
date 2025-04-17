import React from 'react';
import { jsPDF } from 'jspdf';

const PDFDownloadButton = ({ newsletterData, isExporting, setIsExporting }) => {
  // Helper function to load and process an image through canvas
  const processImageWithCanvas = (src, text = null) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => {
        // Create a canvas to draw the image and possibly add text
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Get canvas context and draw image
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        
        // Add text if provided (for lead image)
        if (text) {
          // Add text
          ctx.font = 'bold 64px Arial';
          ctx.fillStyle = 'white';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          
          // Add text shadow for better visibility
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 6;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          
          // Draw text at bottom right with padding
          ctx.fillText(text, canvas.width - 30, canvas.height - 30);
          
          // Reset shadow
          ctx.shadowColor = 'transparent';
          ctx.shadowBlur = 0;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
        }
        
        // Get data URL from canvas
        const dataURL = canvas.toDataURL('image/jpeg', 0.95);
        
        // Create a new image with the data URL
        const processedImg = new Image();
        processedImg.onload = () => {
          resolve({
            img: processedImg,
            dataURL,
            width: img.width,
            height: img.height
          });
        };
        
        processedImg.onerror = () => {
          reject(new Error('Failed to process canvas image'));
        };
        
        processedImg.src = dataURL;
      };
      
      img.onerror = (err) => {
        console.error('Failed to load image:', err);
        reject(new Error('Failed to load image'));
      };
      
      img.src = src;
    });
  };

  // Helper function to sanitize text by removing emoji characters
  const sanitizeText = (text) => {
    if (!text) return '';
    
    // Remove emojis and problematic unicode characters
    return text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[^\x20-\x7E\r\n\t]/g, ' ') // Replace other non-ASCII chars with spaces
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .trim();
  };

  const handlePDFDownload = async () => {
    if (!newsletterData) return;
    
    try {
      setIsExporting(true);
      
      // Create a PDF document with Unicode support
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        putOnlyUsedFonts: true
      });
      
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);
      
      // Start position
      let y = margin;
      
      // Function to check if we need a new page
      const checkForNewPage = (height) => {
        if (y + height > pageHeight - margin) {
          pdf.addPage();
          y = margin;
          return true;
        }
        return false;
      };
      
      // Add title
      pdf.setTextColor(227, 39, 42); // #E3272A
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      
      // Split title into lines if needed
      const titleText = sanitizeText(newsletterData.title) || "Newsletter";
      const titleLines = pdf.splitTextToSize(titleText, contentWidth);
      pdf.text(titleLines, margin, y);
      y += 10 + (titleLines.length * 7);
      
      // Add subtitle and date
      pdf.setTextColor(0);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      
      const subtitleText = `${sanitizeText(newsletterData.subtitle) || ""} | ${sanitizeText(newsletterData.date) || ""}`;
      const subtitleLines = pdf.splitTextToSize(subtitleText, contentWidth);
      pdf.text(subtitleLines, margin, y);
      y += 5 + (subtitleLines.length * 5);
      
      // Try to add lead image directly to the PDF with date text overlay
      if (newsletterData.leadimage) {
        try {
          // Process the image with date text overlay
          const { dataURL, width, height } = await processImageWithCanvas(
            newsletterData.leadimage, 
            newsletterData.date
          );
          
          // Calculate image dimensions to fit within content width
          const imgWidth = contentWidth;
          const imgHeight = (height * imgWidth) / width;
          
          // Check if we need a new page for the image
          checkForNewPage(imgHeight + 10);
          
          // Draw the image with date overlay
          pdf.addImage(
            dataURL, 
            'JPEG', 
            margin, 
            y, 
            imgWidth, 
            imgHeight,
            undefined,
            'FAST'
          );
          
          y += imgHeight + 10;
        } catch (error) {
          console.error('Failed to add lead image to PDF:', error);
          
          // If image loading fails, add a link instead
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(0, 0, 255);
          
          const linkText = "Lead image (click to view): ";
          pdf.text(linkText, margin, y);
          
          // Add URL as a clickable link (ensure URL is wrapped properly)
          const leadImageUrlWidth = pdf.getTextWidth(linkText);
          const imageUrl = newsletterData.leadimage;
          const wrappedImageUrl = pdf.splitTextToSize(imageUrl, contentWidth - leadImageUrlWidth);
          
          // Make first line clickable
          pdf.textWithLink(wrappedImageUrl[0], margin + leadImageUrlWidth, y, {
            url: imageUrl
          });
          
          // Add additional lines if URL is wrapped
          if (wrappedImageUrl.length > 1) {
            for (let i = 1; i < wrappedImageUrl.length; i++) {
              y += 5;
              pdf.textWithLink(wrappedImageUrl[i], margin, y, {
                url: imageUrl
              });
            }
          }
          
          y += 5;
        }
      }
      
      // Add lede text if available
      if (newsletterData.lede) {
        checkForNewPage(20);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0);
        
        const sanitizedLede = sanitizeText(newsletterData.lede);
        const ledeLines = pdf.splitTextToSize(sanitizedLede, contentWidth);
        pdf.text(ledeLines, margin, y);
        y += (ledeLines.length * 6) + 10;
      }
      
      // Add stories using a structured approach
      for (let i = 0; i < newsletterData.stories.length; i++) {
        const story = newsletterData.stories[i];
        
        // Check for new page before starting a new story
        checkForNewPage(40);
        
        // Add separator line
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, y - 5, pageWidth - margin, y - 5);
        
        // Add story headline
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(227, 39, 42); // #E3272A
        pdf.setFontSize(16);
        
        const headlineText = sanitizeText(story.headline);
        const headlineLines = pdf.splitTextToSize(headlineText, contentWidth);
        pdf.text(headlineLines, margin, y);
        y += (headlineLines.length * 7) + 5;
        
        // Try to add story image directly to the PDF
        if (story.image) {
          try {
            // Process the image through canvas
            const { dataURL, width, height } = await processImageWithCanvas(story.image);
            
            // Calculate image dimensions to fit within content width
            const imgWidth = contentWidth;
            const imgHeight = (height * imgWidth) / width;
            
            // Check if we need a new page for the image
            checkForNewPage(imgHeight + 10);
            
            // Draw the image
            pdf.addImage(
              dataURL, 
              'JPEG', 
              margin, 
              y, 
              imgWidth, 
              imgHeight,
              undefined,
              'FAST'
            );
            
            y += imgHeight + 10;
          } catch (error) {
            console.error('Failed to add story image to PDF:', error);
            
            // If image loading fails, add a link instead
            checkForNewPage(10);
            pdf.setFont('helvetica', 'italic');
            pdf.setTextColor(0, 0, 255);
            pdf.setFontSize(10);
            
            // Add URL as a clickable link with proper wrapping
            const imageUrl = story.image;
            const wrappedImageUrl = pdf.splitTextToSize(imageUrl, contentWidth);
            
            // Make first line clickable
            pdf.textWithLink(wrappedImageUrl[0], margin, y, {
              url: imageUrl
            });
            
            // Add additional lines if URL is wrapped
            if (wrappedImageUrl.length > 1) {
              for (let i = 1; i < wrappedImageUrl.length; i++) {
                y += 5;
                pdf.textWithLink(wrappedImageUrl[i], margin, y, {
                  url: imageUrl
                });
              }
            }
            
            y += 8;
          }
        }
        
        // Add section headers and content manually
        checkForNewPage(15);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(51, 51, 51);
        pdf.setFontSize(11);
        y += 6;
        
        pdf.setFont('helvetica', 'normal');
        const whatHappenedText = sanitizeText(story.what_happened);
        const whatHappenedLines = pdf.splitTextToSize(whatHappenedText, contentWidth);
        
        if (checkForNewPage(whatHappenedLines.length * 5)) {
          pdf.setFont('helvetica', 'bold');
          pdf.text("WHAT HAPPENED:", margin, y);
          y += 6;
          pdf.setFont('helvetica', 'normal');
        }
        
        pdf.text(whatHappenedLines, margin, y);
        y += (whatHappenedLines.length * 5) + 8;
        
        // Add "Why it matters" section
        checkForNewPage(15);
        pdf.setFont('helvetica', 'bold');

        y += 6;
        
        pdf.setFont('helvetica', 'normal');
        const whyMattersText = sanitizeText(story.why_it_matters);
        const whyMattersLines = pdf.splitTextToSize(whyMattersText, contentWidth);
        
        if (checkForNewPage(whyMattersLines.length * 5)) {
          pdf.setFont('helvetica', 'bold');
          pdf.text("WHY IT MATTERS:", margin, y);
          y += 6;
          pdf.setFont('helvetica', 'normal');
        }
        
        pdf.text(whyMattersLines, margin, y);
        y += (whyMattersLines.length * 5) + 8;
        
        // Add "So what" section
        checkForNewPage(15);
        pdf.setFont('helvetica', 'bold');
        y += 6;
        
        pdf.setFont('helvetica', 'normal');
        const soWhatText = sanitizeText(story.so_what);
        const soWhatLines = pdf.splitTextToSize(soWhatText, contentWidth);
        
        if (checkForNewPage(soWhatLines.length * 5)) {
          pdf.setFont('helvetica', 'bold');
          pdf.text("SO WHAT:", margin, y);
          y += 6;
          pdf.setFont('helvetica', 'normal');
        }
        
        pdf.text(soWhatLines, margin, y);
        y += (soWhatLines.length * 5) + 8;
        
        // Add URL link
        if (story.url) {
          checkForNewPage(10);
          pdf.setTextColor(0, 0, 255);
          pdf.setFont('helvetica', 'italic');
          pdf.setFontSize(10);
          
          // Add URL as a clickable link with proper wrapping
          const url = story.url;
          const wrappedUrl = pdf.splitTextToSize(url, contentWidth);
          
          // Make first line clickable
          pdf.textWithLink(wrappedUrl[0], margin, y, {
            url: url
          });
          
          // Add additional lines if URL is wrapped
          if (wrappedUrl.length > 1) {
            for (let i = 1; i < wrappedUrl.length; i++) {
              y += 5;
              pdf.textWithLink(wrappedUrl[i], margin, y, {
                url: url
              });
            }
          }
          
          y += 8;
        }
        
        // Add space between stories
        y += 10;
      }
      
      // Save PDF
      const sanitizedTitle = (sanitizeText(newsletterData.title) || 'newsletter')
        .replace(/[^a-z0-9]/gi, '_')
        .toLowerCase();
      
      pdf.save(`${sanitizedTitle}.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert(`PDF generation failed: ${error.message}. Please try again.`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handlePDFDownload}
      disabled={isExporting}
      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center"
    >
      {isExporting ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download PDF
        </>
      )}
    </button>
  );
};

export default PDFDownloadButton; 
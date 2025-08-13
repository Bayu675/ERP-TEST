// File: src/utils/pdfGenerator.js (BARU)
// "Mesin" untuk membuat dokumen PDF Penawaran.

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const generateQuotationPDF = (quotationData) => {
    const doc = new jsPDF();

    // Helper untuk format mata uang
    const formatCurrency = (value) => {
        if (typeof value !== 'number') return 'Rp 0';
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
    };

    // 1. Judul Dokumen
    doc.setFontSize(20);
    doc.text('PENawaran HARGA', 105, 20, { align: 'center' });

    // 2. Informasi Header (Pelanggan, No. Penawaran, dll.)
    doc.setFontSize(10);
    doc.text(`Kepada Yth:`, 14, 35);
    doc.setFont(undefined, 'bold');
    doc.text(`${quotationData.customer.name}`, 14, 40);
    doc.setFont(undefined, 'normal');
    
    doc.text(`Nomor Penawaran:`, 140, 35);
    doc.setFont(undefined, 'bold');
    doc.text(`${quotationData.quotationNumber}`, 140, 40);
    doc.setFont(undefined, 'normal');

    doc.text(`Tanggal:`, 140, 45);
    doc.setFont(undefined, 'bold');
    doc.text(`${new Date(quotationData.quotationDate).toLocaleDateString('id-ID')}`, 140, 50);
    doc.setFont(undefined, 'normal');

    // 3. Tabel Item Barang
    const tableColumn = ["Kode", "Nama Barang", "Ukuran (cm)", "Qty", "Satuan", "Nominal", "Diskon", "Jumlah"];
    const tableRows = [];

    quotationData.items.forEach(item => {
        const discountString = item.discounts.map(d => d.discountPercentage).filter(d => d > 0).join('+');
        const itemData = [
            item.sku,
            item.description,
            `${item.width} x ${item.height}`,
            item.quantity,
            item.uom,
            formatCurrency(item.basePrice),
            `${discountString}%`,
            formatCurrency(item.netPrice)
        ];
        tableRows.push(itemData);
    });

    doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 60,
        theme: 'grid',
        headStyles: { fillColor: [22, 160, 133] }, // Warna header
    });

    // 4. Rincian Total di Bawah Tabel
    const finalY = doc.lastAutoTable.finalY + 10;
    const rightAlignX = 196;

    doc.setFontSize(10);
    doc.text('Subtotal:', 140, finalY);
    doc.text(formatCurrency(quotationData.subTotal), rightAlignX, finalY, { align: 'right' });

    doc.text('Total Diskon:', 140, finalY + 5);
    doc.text(formatCurrency(-quotationData.totalItemDiscount), rightAlignX, finalY + 5, { align: 'right' });
    
    doc.text('PPN (11%):', 140, finalY + 10);
    doc.text(formatCurrency(quotationData.totalTax), rightAlignX, finalY + 10, { align: 'right' });
    
    doc.setFont(undefined, 'bold');
    doc.setFontSize(12);
    doc.text('Grand Total:', 140, finalY + 17);
    doc.text(formatCurrency(quotationData.grandTotal), rightAlignX, finalY + 17, { align: 'right' });

    // 5. Simpan PDF
    doc.save(`Penawaran-${quotationData.quotationNumber}.pdf`);
};

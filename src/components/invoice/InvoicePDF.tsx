import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface InvoiceData {
  invoice_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  order_number?: string;
  created_at: string;
  due_date?: string;
  items: {
    description: string;
    service_type?: string;
    package_name?: string;
    domain?: string;
    qty: number;
    price: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  advance_paid: number;
  due_amount: number;
  status: string;
  notes?: string;
}

interface InvoicePDFProps {
  invoice: InvoiceData;
  companyName?: string;
  companyAddress?: string;
  companyPhone?: string;
  companyEmail?: string;
}

export function InvoicePDF({
  invoice,
  companyName = 'DigiWebDex',
  companyAddress = 'Dhaka, Bangladesh',
  companyPhone = '+880 1XXX-XXXXXX',
  companyEmail = 'info@digiwebdex.com',
}: InvoicePDFProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);

  const generatePDF = async () => {
    if (!invoiceRef.current) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${invoice.invoice_number}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  const fmt = (n: number) => `৳${n.toLocaleString()}`;

  return (
    <div>
      {/* Download Button */}
      <Button onClick={generatePDF} disabled={generating} className="mb-4">
        {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
        {generating ? 'Generating...' : 'Download PDF'}
      </Button>

      {/* Invoice Template (rendered for capture) */}
      <div
        ref={invoiceRef}
        id="invoice-area"
        style={{
          width: '794px',
          padding: '40px',
          backgroundColor: '#fff',
          color: '#111',
          fontFamily: 'Arial, sans-serif',
          fontSize: '13px',
          lineHeight: '1.5',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', borderBottom: '3px solid #2563eb', paddingBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#2563eb', margin: 0 }}>{companyName}</h1>
            <p style={{ margin: '4px 0 0', color: '#666' }}>{companyAddress}</p>
            <p style={{ margin: '2px 0 0', color: '#666' }}>{companyPhone} | {companyEmail}</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111', margin: 0 }}>INVOICE</h2>
            <p style={{ margin: '4px 0 0', fontWeight: 'bold' }}>{invoice.invoice_number}</p>
            <p style={{ margin: '2px 0 0', color: '#666' }}>Date: {invoice.created_at}</p>
            {invoice.due_date && <p style={{ margin: '2px 0 0', color: '#666' }}>Due: {invoice.due_date}</p>}
            <span
              style={{
                display: 'inline-block',
                marginTop: '6px',
                padding: '2px 10px',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                backgroundColor: invoice.status === 'paid' ? '#dcfce7' : invoice.status === 'partial' ? '#fef9c3' : '#fee2e2',
                color: invoice.status === 'paid' ? '#166534' : invoice.status === 'partial' ? '#854d0e' : '#991b1b',
              }}
            >
              {invoice.status}
            </span>
          </div>
        </div>

        {/* Bill To */}
        <div style={{ marginBottom: '24px' }}>
          <p style={{ fontWeight: 'bold', color: '#2563eb', marginBottom: '4px', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px' }}>Bill To</p>
          <p style={{ fontWeight: 'bold', fontSize: '15px', margin: 0 }}>{invoice.customer_name}</p>
          {invoice.customer_phone && <p style={{ margin: '2px 0', color: '#555' }}>{invoice.customer_phone}</p>}
          {invoice.customer_email && <p style={{ margin: '2px 0', color: '#555' }}>{invoice.customer_email}</p>}
          {invoice.customer_address && <p style={{ margin: '2px 0', color: '#555' }}>{invoice.customer_address}</p>}
          {invoice.order_number && <p style={{ margin: '4px 0 0', color: '#888', fontSize: '12px' }}>Order: {invoice.order_number}</p>}
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '24px' }}>
          <thead>
            <tr style={{ backgroundColor: '#2563eb', color: '#fff' }}>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px' }}>#</th>
              <th style={{ padding: '10px 12px', textAlign: 'left', fontSize: '12px' }}>Description</th>
              <th style={{ padding: '10px 12px', textAlign: 'center', fontSize: '12px' }}>Qty</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px' }}>Price</th>
              <th style={{ padding: '10px 12px', textAlign: 'right', fontSize: '12px' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, i) => (
              <tr key={i} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: i % 2 === 0 ? '#f9fafb' : '#fff' }}>
                <td style={{ padding: '10px 12px' }}>{i + 1}</td>
                <td style={{ padding: '10px 12px' }}>
                  <strong>{item.description || item.package_name || 'Service'}</strong>
                  {item.service_type && <span style={{ color: '#888', fontSize: '11px' }}> ({item.service_type})</span>}
                  {item.domain && <div style={{ color: '#666', fontSize: '11px' }}>{item.domain}</div>}
                </td>
                <td style={{ padding: '10px 12px', textAlign: 'center' }}>{item.qty}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right' }}>{fmt(item.price)}</td>
                <td style={{ padding: '10px 12px', textAlign: 'right', fontWeight: 'bold' }}>{fmt(item.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <table style={{ width: '280px' }}>
            <tbody>
              <tr><td style={{ padding: '4px 0', color: '#666' }}>Subtotal</td><td style={{ textAlign: 'right', padding: '4px 0' }}>{fmt(invoice.subtotal)}</td></tr>
              {invoice.discount > 0 && <tr><td style={{ padding: '4px 0', color: '#666' }}>Discount</td><td style={{ textAlign: 'right', padding: '4px 0', color: '#dc2626' }}>-{fmt(invoice.discount)}</td></tr>}
              {invoice.tax > 0 && <tr><td style={{ padding: '4px 0', color: '#666' }}>Tax</td><td style={{ textAlign: 'right', padding: '4px 0' }}>{fmt(invoice.tax)}</td></tr>}
              <tr style={{ borderTop: '2px solid #111' }}>
                <td style={{ padding: '8px 0', fontWeight: 'bold', fontSize: '15px' }}>Total</td>
                <td style={{ textAlign: 'right', padding: '8px 0', fontWeight: 'bold', fontSize: '15px' }}>{fmt(invoice.total)}</td>
              </tr>
              {invoice.advance_paid > 0 && <tr><td style={{ padding: '4px 0', color: '#16a34a' }}>Paid</td><td style={{ textAlign: 'right', padding: '4px 0', color: '#16a34a' }}>{fmt(invoice.advance_paid)}</td></tr>}
              {invoice.due_amount > 0 && (
                <tr style={{ backgroundColor: '#fef2f2' }}>
                  <td style={{ padding: '6px 4px', fontWeight: 'bold', color: '#dc2626' }}>Due</td>
                  <td style={{ textAlign: 'right', padding: '6px 4px', fontWeight: 'bold', color: '#dc2626', fontSize: '15px' }}>{fmt(invoice.due_amount)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div style={{ marginTop: '24px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
            <p style={{ fontWeight: 'bold', fontSize: '12px', color: '#888', marginBottom: '4px' }}>Notes</p>
            <p style={{ margin: 0 }}>{invoice.notes}</p>
          </div>
        )}

        {/* Footer */}
        <div style={{ marginTop: '40px', textAlign: 'center', color: '#999', fontSize: '11px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
          <p style={{ margin: 0 }}>Thank you for your business!</p>
          <p style={{ margin: '4px 0 0' }}>{companyName} — {companyEmail}</p>
        </div>
      </div>
    </div>
  );
}

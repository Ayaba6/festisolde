import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Style spécifique pour le PDF (proche de ton design "Mon Trésor")
const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: '#FFFFFF', fontFamily: 'Helvetica' },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  title: { fontSize: 24, fontWeight: 'black', color: '#ea580c' }, // Orange-600
  infoSection: { marginBottom: 20, padding: 15, backgroundColor: '#f9fafb', borderRadius: 10 },
  label: { fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 4 },
  value: { fontSize: 12, fontWeight: 'bold' },
  tableHeader: { flexDirection: 'row', borderBottom: 1, borderColor: '#f3f4f6', paddingBottom: 5, marginBottom: 10 },
  tableRow: { flexDirection: 'row', paddingVertical: 8, borderBottom: 1, borderColor: '#f9fafb' },
  colName: { flex: 3, fontSize: 10 },
  colQty: { flex: 1, fontSize: 10, textAlign: 'center' },
  colPrice: { flex: 1, fontSize: 10, textAlign: 'right' },
  totalSection: { marginTop: 30, borderTop: 2, borderColor: '#f3f4f6', paddingTop: 15, flexDirection: 'row', justifyContent: 'space-between' },
  totalLabel: { fontSize: 12, fontWeight: 'bold' },
  totalValue: { fontSize: 20, fontWeight: 'bold', color: '#111827' }
});

export const InvoicePDF = ({ order }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>FACTURE</Text>
          <Text style={{ fontSize: 9, color: '#9ca3af' }}>#{order.id.slice(0, 8)}</Text>
        </View>
        <Text style={{ fontSize: 10 }}>{new Date(order.created_at).toLocaleDateString('fr-FR')}</Text>
      </View>

      {/* Client Info */}
      <View style={styles.infoSection}>
        <Text style={styles.label}>Client</Text>
        <Text style={styles.value}>{order.customer_name}</Text>
        <Text style={{ fontSize: 10, color: '#4b5563', marginTop: 2 }}>{order.customer_phone}</Text>
      </View>

      {/* Articles */}
      <View style={styles.tableHeader}>
        <Text style={[styles.colName, styles.label]}>Article</Text>
        <Text style={[styles.colQty, styles.label]}>Qté</Text>
        <Text style={[styles.colPrice, styles.label]}>Prix</Text>
      </View>

      {order.items?.map((item, i) => (
        <View key={i} style={styles.tableRow}>
          <Text style={styles.colName}>{item.name}</Text>
          <Text style={styles.colQty}>x{item.quantity}</Text>
          <Text style={styles.colPrice}>{(item.sale_price * item.quantity).toLocaleString()} CFA</Text>
        </View>
      ))}

      {/* Total */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>TOTAL</Text>
        <Text style={styles.totalValue}>{order.total_amount?.toLocaleString()} CFA</Text>
      </View>
    </Page>
  </Document>
);
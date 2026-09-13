/* eslint-disable jsx-a11y/alt-text -- This file uses @react-pdf/renderer Image, not an HTML img element. */
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 60,
    paddingHorizontal: 50,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: '#111',
  },
  // ── KOP SURAT ──────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  logo: {
    width: 70,
    height: 70,
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerOrg: {
    fontSize: 13,
    fontFamily: 'Times-Bold',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerSub: {
    fontSize: 11,
    fontFamily: 'Times-Roman',
    marginBottom: 1,
  },
  headerAddress: {
    fontSize: 9,
    fontFamily: 'Times-Roman',
    marginTop: 3,
    color: '#333',
  },
  dividerThick: {
    borderBottomWidth: 3,
    borderBottomColor: '#8B7533',
    marginTop: 6,
    marginBottom: 1,
  },
  dividerThin: {
    borderBottomWidth: 1,
    borderBottomColor: '#8B7533',
    marginBottom: 18,
  },
  // ── JUDUL SURAT ─────────────────────────────────────────────
  titleContainer: {
    alignItems: 'center',
    marginBottom: 14,
  },
  titleMain: {
    fontSize: 13,
    fontFamily: 'Times-Bold',
    textDecoration: 'underline',
    letterSpacing: 1,
  },
  titleNomor: {
    fontSize: 10,
    fontFamily: 'Times-Roman',
    marginTop: 3,
  },
  // ── ISI SURAT ─────────────────────────────────────────────
  paragraph: {
    fontSize: 11,
    fontFamily: 'Times-Roman',
    lineHeight: 1.8,
    textAlign: 'justify',
    marginBottom: 10,
  },
  tableSection: {
    marginLeft: 20,
    marginBottom: 12,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  tableLabel: {
    width: 135,
    fontFamily: 'Times-Roman',
    fontSize: 11,
  },
  tableColon: {
    width: 12,
    fontFamily: 'Times-Roman',
    fontSize: 11,
  },
  tableValue: {
    flex: 1,
    fontFamily: 'Times-Bold',
    fontSize: 11,
  },
  closingParagraph: {
    fontSize: 11,
    fontFamily: 'Times-Roman',
    lineHeight: 1.8,
    textAlign: 'justify',
    marginTop: 8,
    marginBottom: 24,
  },
  // ── FOOTER TTD ──────────────────────────────────────────────
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  signatureBlock: {
    width: '45%',
    alignItems: 'center',
  },
  signatureLabel: {
    fontSize: 11,
    fontFamily: 'Times-Roman',
    marginBottom: 2,
    textAlign: 'center',
  },
  signatureRole: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    marginBottom: 55,
    textAlign: 'center',
  },
  signatureName: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    textDecoration: 'underline',
    textAlign: 'center',
  },
  signatureStempel: {
    fontSize: 9,
    fontFamily: 'Times-Roman',
    color: '#555',
    marginTop: 2,
    textAlign: 'center',
  },
});

// Teks kalimat yang berubah sesuai jenis surat
function getKalimatKeperluan(jenisSurat: string, keperluan: string): string {
  const kalimatMap: Record<string, string> = {
    'Pengantar KTP / KK': `memohon surat pengantar kepada Kelurahan untuk keperluan pengurusan Kartu Tanda Penduduk (KTP) / Kartu Keluarga (KK). Keperluan tambahan: ${keperluan}`,
    'Surat Keterangan Domisili': `benar-benar berdomisili di wilayah kami dan membutuhkan Surat Keterangan Domisili untuk keperluan: ${keperluan}`,
    'Surat Keterangan Usaha (SKU)': `menjalankan usaha di wilayah kami dan mengajukan permohonan Surat Keterangan Usaha (SKU) untuk keperluan: ${keperluan}`,
    'Surat Keterangan Tidak Mampu (SKTM)': `merupakan warga yang secara ekonomi tergolong tidak mampu dan mengajukan permohonan Surat Keterangan Tidak Mampu (SKTM) untuk keperluan: ${keperluan}`,
    'Surat Pengantar Nikah (N1-N4)': `akan melangsungkan pernikahan dan mengajukan permohonan surat pengantar nikah (formulir N1-N4) untuk disampaikan ke KUA setempat. Keperluan: ${keperluan}`,
    'Surat Keterangan Kematian': `mengajukan permohonan Surat Keterangan Kematian atas nama anggota keluarga untuk keperluan: ${keperluan}`,
    'Surat Keterangan Kelahiran': `mengajukan permohonan Surat Keterangan Kelahiran untuk keperluan pengurusan akta kelahiran ke Dukcapil. Keperluan: ${keperluan}`,
    'Surat Izin Keramaian': `bermaksud mengadakan acara keramaian di wilayah RT/RW dan mengajukan permohonan Surat Izin Keramaian. Keperluan: ${keperluan}`,
    'Surat Keterangan Pindah': `bermaksud pindah domisili dan mengajukan permohonan Surat Keterangan Pindah untuk keperluan: ${keperluan}`,
    'Surat Keterangan Belum Menikah': `mengajukan permohonan Surat Keterangan Belum Menikah (status masih lajang) untuk keperluan: ${keperluan}`,
    'Surat Pengantar SKCK': `mengajukan permohonan surat pengantar ke Kepolisian untuk pembuatan Surat Keterangan Catatan Kepolisian (SKCK). Keperluan: ${keperluan}`,
    'Surat Keterangan Ahli Waris': `mengajukan permohonan Surat Keterangan Ahli Waris untuk keperluan pengurusan harta warisan. Keperluan: ${keperluan}`,
  };
  return kalimatMap[jenisSurat] || `mengajukan permohonan surat pengantar untuk keperluan: ${keperluan}`;
}

export interface SuratPengantarPDFProps {
  data: {
    nama: string;
    nik: string;
    rt: string;
    keperluan: string;
    jenisSurat: string;
    tanggal: string;
    namaKetuaRt: string;
    namaKetuaRw: string;
    jenisPengesahan: 'rt_saja' | 'rt_rw';
    logoBase64?: string;
  };
}

export const SuratPengantarPDF: React.FC<SuratPengantarPDFProps> = ({ data }) => {
  const year = new Date().getFullYear();
  const kalimatKeperluan = getKalimatKeperluan(data.jenisSurat, data.keperluan);

  return (
    <Document title={`Surat Pengantar - ${data.nama}`} author="RW 10 Desa Cicadas">
      <Page size="A4" style={styles.page}>

        {/* ── KOP SURAT ─────────────────────── */}
        <View style={styles.header}>
          {data.logoBase64 ? (
            <Image style={styles.logo} src={data.logoBase64} />
          ) : null}
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerOrg}>RUKUN WARGA 10</Text>
            <Text style={styles.headerOrg}>DESA CICADAS</Text>
            <Text style={styles.headerSub}>Kecamatan Gunung Putri, Kabupaten Bogor</Text>
            <Text style={styles.headerSub}>Provinsi Jawa Barat</Text>
            <Text style={styles.headerAddress}>
              Sekretariat: Jl. Mercedes Benz, Desa Cicadas, Kec. Gunung Putri, Bogor 16964
            </Text>
          </View>
        </View>
        <View style={styles.dividerThick} />
        <View style={styles.dividerThin} />

        {/* ── JUDUL SURAT ─────────────────────── */}
        <View style={styles.titleContainer}>
          <Text style={styles.titleMain}>SURAT PENGANTAR</Text>
          <Text style={styles.titleNomor}>Nomor: ......./RT.{data.rt}/RW.10/{year}</Text>
        </View>

        {/* ── PEMBUKA ─────────────────────────── */}
        <Text style={styles.paragraph}>
          Yang bertanda tangan di bawah ini, Ketua RT {data.rt} RW 10 Desa Cicadas, Kecamatan Gunung Putri, Kabupaten Bogor, Provinsi Jawa Barat, dengan ini menerangkan dengan sebenar-benarnya bahwa:
        </Text>

        {/* ── DATA WARGA ─────────────────────── */}
        <View style={styles.tableSection}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Nama Lengkap</Text>
            <Text style={styles.tableColon}>:</Text>
            <Text style={styles.tableValue}>{data.nama}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>NIK</Text>
            <Text style={styles.tableColon}>:</Text>
            <Text style={styles.tableValue}>{data.nik}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Domisili</Text>
            <Text style={styles.tableColon}>:</Text>
            <Text style={styles.tableValue}>RT {data.rt} / RW 10, Desa Cicadas, Kec. Gunung Putri</Text>
          </View>
        </View>

        {/* ── ISI / KEPERLUAN ─────────────────── */}
        <Text style={styles.paragraph}>
          Adalah benar warga kami yang berdomisili di lingkungan RT {data.rt} RW 10 Desa Cicadas. Warga tersebut {kalimatKeperluan}.
        </Text>

        <Text style={styles.paragraph}>
          Kami selaku Ketua RT {data.rt} RW 10 tidak berkeberatan dan memberikan ijin kepada yang bersangkutan untuk mengurus keperluan tersebut di atas ke instansi yang berwenang, dengan harapan kiranya dapat diproses dan dibantu sebagaimana mestinya.
        </Text>

        {/* ── PENUTUP ─────────────────────────── */}
        <Text style={styles.closingParagraph}>
          Demikian surat pengantar ini dibuat dengan sebenar-benarnya, untuk dapat dipergunakan sebagaimana mestinya. Atas perhatian dan kerjasamanya, kami ucapkan terima kasih.
        </Text>

        {/* ── TANDA TANGAN ─────────────────────── */}
        <View style={styles.footer}>
          {data.jenisPengesahan === 'rt_rw' ? (
            <View style={styles.signatureBlock}>
              <Text style={styles.signatureLabel}>Mengetahui,</Text>
              <Text style={styles.signatureRole}>Ketua RW 10</Text>
              <Text style={styles.signatureName}>{data.namaKetuaRw || '( ........................ )'}</Text>
              <Text style={styles.signatureStempel}>(Tanda Tangan &amp; Stempel)</Text>
            </View>
          ) : (
            <View style={styles.signatureBlock} />
          )}

          <View style={styles.signatureBlock}>
            <Text style={styles.signatureLabel}>Bogor, {data.tanggal}</Text>
            <Text style={styles.signatureRole}>Ketua RT {data.rt} RW 10</Text>
            <Text style={styles.signatureName}>{data.namaKetuaRt || '( ........................ )'}</Text>
            <Text style={styles.signatureStempel}>(Tanda Tangan &amp; Stempel)</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
};

export default SuratPengantarPDF;

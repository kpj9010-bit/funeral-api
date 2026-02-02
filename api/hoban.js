export default async function handler(req, res) {
  try {
    // CORS 허용
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const url =
      "http://www.hobanfuneral.co.kr/index.php?mid=sub43&order_type=asc&sort_index=var1";

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
      },
    });

    const html = await response.text();
    if (!html || html.length < 100) {
      return res.status(200).json({
        success: true,
        updatedAt: new Date().toISOString(),
        items: [],
        note: "HTML 수신 실패",
      });
    }

    // =========================
    // HTML 파싱
    // =========================
    const { parse } = await import("node-html-parser");
    const root = parse(html);

    const rows = root.querySelectorAll("tr");
    const items = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll("td");
      if (!cells || cells.length < 6) return;

      const roomText = cells[0].text.trim();

      // ✅ 빈소 데이터 행만 필터
      if (!roomText.includes("호")) return;

      items.push({
        room: roomText,
        deceased: cells[1].text.trim(),
        enteredAt: cells[2].text.trim(),
        chief: cells[3].text.trim(),
        burial: cells[4].text.trim(),
        departure: cells[5].text.trim(),
        note: cells[6] ? cells[6].text.trim() : "",
      });
    });

    return res.status(200).json({
      success: true,
      updatedAt: new Date().toISOString(),
      items,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error?.message || String(error),
    });
  }
}

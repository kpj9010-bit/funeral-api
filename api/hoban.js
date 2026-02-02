export default async function handler(req, res) {
  try {
    // CORS 허용 (GitHub Pages에서 호출 가능)
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
        note: "HTML을 정상적으로 가져오지 못함",
      });
    }

    // 아직 파싱 안 함 (다음 단계)
    // ✅ HTML 파싱 시작
const { parse } = await import("node-html-parser");
const root = parse(html);

// 테이블 행들 가져오기
const rows = root.querySelectorAll("table tbody tr");

const items = [];

rows.forEach((row) => {
  const cells = row.querySelectorAll("td");
  if (!cells || cells.length < 6) return;

  items.push({
    room: cells[0].text.trim(),       // 빈소명
    deceased: cells[1].text.trim(),   // 고인명
    enteredAt: cells[2].text.trim(),  // 입관일시
    chief: cells[3].text.trim(),      // 상주
    burial: cells[4].text.trim(),     // 장지
    departure: cells[5].text.trim(),  // 발인일시
    note: cells[6] ? cells[6].text.trim() : "",
  });
});


    return res.status(200).json({
      success: true,
      updatedAt: new Date().toISOString(),
      items,
      note: "API 정상 실행 확인 단계",
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error?.message || String(error),
    });
  }
}

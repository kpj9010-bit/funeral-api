export default async function handler(req, res) {
  try {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") return res.status(200).end();

    const url =
      "http://www.hobanfuneral.co.kr/index.php?mid=sub43&order_type=asc&sort_index=var1";

    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome Safari",
        "Accept":
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
    });

    const html = await response.text();

    // ✅ 여기서부터 진단
    const { parse } = await import("node-html-parser");
    const root = parse(html);

    const trs = root.querySelectorAll("tr");
    let tdRows = 0;
    let tdRows6 = 0;
    const samples = [];

    const items = [];

    trs.forEach((tr) => {
      const tds = tr.querySelectorAll("td");
      if (tds && tds.length > 0) tdRows++;
      if (!tds || tds.length < 1) return;

      // 샘플 몇 개만 모으기 (첫 칸 텍스트)
      if (samples.length < 10) {
        samples.push({
          tdCount: tds.length,
          col0: tds[0]?.text?.trim?.() || "",
          col1: tds[1]?.text?.trim?.() || "",
        });
      }

      if (tds.length >= 6) {
        tdRows6++;

        const col0 = (tds[0]?.text || "").trim();

        // 헤더/잡행 제외: 첫 칸이 "빈소명"이면 스킵
        if (col0.includes("빈소") && col0.includes("명")) return;

        items.push({
          room: col0,
          deceased: (tds[1]?.text || "").trim(),
          enteredAt: (tds[2]?.text || "").trim(),
          chief: (tds[3]?.text || "").trim(),
          burial: (tds[4]?.text || "").trim(),
          departure: (tds[5]?.text || "").trim(),
          note: tds[6] ? (tds[6].text || "").trim() : "",
        });
      }
    });

    // ✅ debug=1일 때만 진단 정보 보여주기
    const isDebug = String(req.query?.debug || "") === "1";

    return res.status(200).json({
      success: true,
      updatedAt: new Date().toISOString(),
      items,
      debug: isDebug
        ? {
            httpStatus: response.status,
            htmlLength: html?.length || 0,
            trCount: trs.length,
            tdRowCount: tdRows,
            tdRowCountAtLeast6: tdRows6,
            sampleRows: samples,
            htmlHead: (html || "").slice(0, 300), // 앞부분 300글자만
          }
        : undefined,
    });
  } catch (error) {
    return res.status(200).json({
      success: false,
      error: error?.message || String(error),
    });
  }
}

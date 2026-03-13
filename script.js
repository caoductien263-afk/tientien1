/* --- DỮ LIỆU MẶC ĐỊNH --- */
const defaultData = {
    "40": { "tu_vung": [], "ngu_phap": [], "bai_doc": [], "bai_nghe": [], "kanji": [] }
};
let database = {};

/* --- TÙY CHỈNH ẨN CỘT & TỐC ĐỘ ĐỌC --- */
let isGlobalObscured = true;
let hiddenConfig = { 
    kanji: false, hira: true, hv: true, vn: true, example: true, 
    gram_pattern: false, gram_exp: true, gram_exjp: true, gram_exvn: true,
    speed: 1.0 
};

function loadSettings() {
    const storedConfig = localStorage.getItem("minnaHiddenConfig");
    if (storedConfig) hiddenConfig = JSON.parse(storedConfig);
    
    if(document.getElementById("chk-kanji")) document.getElementById("chk-kanji").checked = hiddenConfig.kanji;
    if(document.getElementById("chk-hira")) document.getElementById("chk-hira").checked = hiddenConfig.hira;
    if(document.getElementById("chk-hv")) document.getElementById("chk-hv").checked = hiddenConfig.hv;
    if(document.getElementById("chk-vn")) document.getElementById("chk-vn").checked = hiddenConfig.vn;
    if(document.getElementById("chk-ex")) document.getElementById("chk-ex").checked = hiddenConfig.example !== undefined ? hiddenConfig.example : true;
    
    if(document.getElementById("chk-gram-pattern")) document.getElementById("chk-gram-pattern").checked = hiddenConfig.gram_pattern || false;
    if(document.getElementById("chk-gram-exp")) document.getElementById("chk-gram-exp").checked = hiddenConfig.gram_exp || false;
    if(document.getElementById("chk-gram-exjp")) document.getElementById("chk-gram-exjp").checked = hiddenConfig.gram_exjp || false;
    if(document.getElementById("chk-gram-exvn")) document.getElementById("chk-gram-exvn").checked = hiddenConfig.gram_exvn || false;
    
    if (hiddenConfig.speed) {
        document.getElementById("speechSpeed").value = hiddenConfig.speed;
        document.getElementById("speedLabel").innerText = hiddenConfig.speed + "x";
    }

    applyHiddenClasses();
}

function saveSettings() {
    if(document.getElementById("chk-kanji")) hiddenConfig.kanji = document.getElementById("chk-kanji").checked;
    if(document.getElementById("chk-hira")) hiddenConfig.hira = document.getElementById("chk-hira").checked;
    if(document.getElementById("chk-hv")) hiddenConfig.hv = document.getElementById("chk-hv").checked;
    if(document.getElementById("chk-vn")) hiddenConfig.vn = document.getElementById("chk-vn").checked;
    if(document.getElementById("chk-ex")) hiddenConfig.example = document.getElementById("chk-ex").checked;
    
    if(document.getElementById("chk-gram-pattern")) hiddenConfig.gram_pattern = document.getElementById("chk-gram-pattern").checked;
    if(document.getElementById("chk-gram-exp")) hiddenConfig.gram_exp = document.getElementById("chk-gram-exp").checked;
    if(document.getElementById("chk-gram-exjp")) hiddenConfig.gram_exjp = document.getElementById("chk-gram-exjp").checked;
    if(document.getElementById("chk-gram-exvn")) hiddenConfig.gram_exvn = document.getElementById("chk-gram-exvn").checked;
    
    hiddenConfig.speed = parseFloat(document.getElementById("speechSpeed").value);
    document.getElementById("speedLabel").innerText = hiddenConfig.speed.toFixed(1) + "x";

    localStorage.setItem("minnaHiddenConfig", JSON.stringify(hiddenConfig));
    applyHiddenClasses();
}

function applyHiddenClasses() {
    if (hiddenConfig.kanji) document.body.classList.add("hide-kanji"); else document.body.classList.remove("hide-kanji");
    if (hiddenConfig.hira) document.body.classList.add("hide-hira"); else document.body.classList.remove("hide-hira");
    if (hiddenConfig.hv) document.body.classList.add("hide-hv"); else document.body.classList.remove("hide-hv");
    if (hiddenConfig.vn) document.body.classList.add("hide-vn"); else document.body.classList.remove("hide-vn");
    if (hiddenConfig.example) document.body.classList.add("hide-example"); else document.body.classList.remove("hide-example");
    
    if (hiddenConfig.gram_pattern) document.body.classList.add("hide-gram-pattern"); else document.body.classList.remove("hide-gram-pattern");
    if (hiddenConfig.gram_exp) document.body.classList.add("hide-gram-exp"); else document.body.classList.remove("hide-gram-exp");
    if (hiddenConfig.gram_exjp) document.body.classList.add("hide-gram-exjp"); else document.body.classList.remove("hide-gram-exjp");
    if (hiddenConfig.gram_exvn) document.body.classList.add("hide-gram-exvn"); else document.body.classList.remove("hide-gram-exvn");
}

/* --- TÍNH NĂNG ĐỌC PHÁT ÂM (TEXT TO SPEECH) --- */
function speakText(text, event) {
    if (event) event.stopPropagation(); 
    if (!text) return;
    window.speechSynthesis.cancel();
    let utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP'; 
    utterance.rate = hiddenConfig.speed || 1.0; 
    window.speechSynthesis.speak(utterance);
}

/* --- KHỞI TẠO APP --- */
function initApp() {
    const storedData = localStorage.getItem("minnaData");
    if (storedData) database = JSON.parse(storedData);
    else database = defaultData;
    
    loadSettings();
    renderLessonSelect();
    renderCards();
}

/* --- QUẢN LÝ BÀI HỌC --- */
function renderLessonSelect() {
    const lessonSelect = document.getElementById("selectLesson");
    const currentSelection = lessonSelect.value;
    lessonSelect.innerHTML = "";
    
    const lessons = Object.keys(database).sort((a, b) => b - a);
    if (lessons.length === 0) {
        const option = document.createElement("option"); option.text = "(Trống)"; lessonSelect.appendChild(option); return;
    }

    lessons.forEach(bai => {
        const option = document.createElement("option"); option.value = bai; option.text = "Bài " + bai; lessonSelect.appendChild(option);
    });

    if (lessons.includes(currentSelection)) lessonSelect.value = currentSelection;
    else if (lessons.length > 0) lessonSelect.value = lessons[0];
}

function createNewLesson() {
    let lesson = prompt("Nhập số bài mới (VD: 43):");
    if (lesson) {
        lesson = lesson.trim();
        if (database[lesson]) {
            alert("Bài " + lesson + " đã có rồi!"); document.getElementById("selectLesson").value = lesson; renderCards();
        } else {
            database[lesson] = { "tu_vung": [], "ngu_phap": [], "bai_doc": [], "bai_nghe": [], "kanji": [] };
            localStorage.setItem("minnaData", JSON.stringify(database));
            renderLessonSelect(); document.getElementById("selectLesson").value = lesson; renderCards(); showToast("Đã tạo Bài " + lesson);
        }
    }
}

function deleteCurrentLesson() {
    const lesson = document.getElementById("selectLesson").value;
    if (!lesson || !database[lesson]) return;
    if (confirm("Xóa TOÀN BỘ Bài " + lesson + " này?")) {
        delete database[lesson]; localStorage.setItem("minnaData", JSON.stringify(database));
        showToast("Đã xóa Bài " + lesson); renderLessonSelect(); renderCards();
    }
}

function deleteItem(index) {
    const lesson = document.getElementById("selectLesson").value;
    const type = document.getElementById("selectType").value;
    if (confirm("Xóa thẻ này?")) {
        database[lesson][type].splice(index, 1); localStorage.setItem("minnaData", JSON.stringify(database));
        renderCards(); showToast("Đã xóa thẻ!");
    }
}

/* --- SAO LƯU & KHÔI PHỤC --- */
function exportData() {
    const dataStr = JSON.stringify(database, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a");
    a.href = url; a.download = "minna_backup_" + new Date().toISOString().slice(0,10) + ".json";
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
    showToast("✅ Đã tải file sao lưu!");
}

function triggerImport() { document.getElementById("fileInput").click(); }

function importData(input) {
    const file = input.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const newData = JSON.parse(e.target.result);
            if (newData && typeof newData === 'object') {
                if(confirm("Dữ liệu hiện tại sẽ bị thay thế. Bạn có chắc không?")) {
                    database = newData; localStorage.setItem("minnaData", JSON.stringify(database));
                    renderLessonSelect(); renderCards(); hideAllPanels(); showToast("✅ Đã khôi phục thành công!");
                }
            } else alert("File không hợp lệ!");
        } catch (err) { alert("Lỗi đọc file: " + err); }
    };
    reader.readAsText(file); input.value = '';
}

/* --- BẬT/TẮT CÁC BẢNG ĐIỀU KHIỂN --- */
function hideAllPanels() {
    document.getElementById("settingsArea").style.display = "none";
    document.getElementById("inputArea").style.display = "none";
    document.getElementById("statsArea").style.display = "none";
    document.getElementById("settingsArea").classList.remove("show");
    document.getElementById("inputArea").classList.remove("show");
    document.getElementById("statsArea").classList.remove("show");
}

function toggleInput() {
    const box = document.getElementById("inputArea"); const isHidden = box.style.display === "none"; hideAllPanels();
    if (isHidden) { box.style.display = "block"; box.classList.add("show"); document.getElementById("inpLesson").value = document.getElementById("selectLesson").value; }
}

function toggleSettings() {
    const box = document.getElementById("settingsArea"); const isHidden = box.style.display === "none"; hideAllPanels();
    if (isHidden) { box.style.display = "block"; box.classList.add("show"); }
}

function toggleStats() {
    const box = document.getElementById("statsArea"); const isHidden = box.style.display === "none"; hideAllPanels();
    if (isHidden) { box.style.display = "block"; box.classList.add("show"); renderStats(); }
}

function toggleAllObscure() {
    isGlobalObscured = !isGlobalObscured; renderCards();
    showToast(isGlobalObscured ? "Đã BẬT chế độ che chữ" : "Đã TẮT chế độ che chữ");
}

/* --- NHẬP DỮ LIỆU --- */
function saveBulkData() {
    const lesson = document.getElementById("inpLesson").value.trim();
    const type = document.getElementById("selectType").value;
    const bulkText = document.getElementById("inpBulk").value.trim();

    if (!lesson || !bulkText) return showToast("⚠️ Thiếu thông tin!");
    if (!database[lesson]) database[lesson] = { "tu_vung": [], "ngu_phap": [], "bai_doc": [], "bai_nghe": [], "kanji": [] };
    if (!database[lesson][type]) database[lesson][type] = [];

    const lines = bulkText.split('\n'); let count = 0;
    lines.reverse().forEach(line => {
        if(line.trim() === "") return;
        let separator = line.includes("-") ? "-" : (line.includes(":") ? ":" : "");
        if (separator) {
            let parts = line.split(separator);
            let mat_truoc = parts[0].trim().replace(/^[•\-\*]\s*/, '').replace(/\(\d+\)$/, '').trim();
            let mat_sau = parts.slice(1).join(separator).trim();

            if (type === "tu_vung") {
                let subParts = mat_sau.split(',');
                database[lesson][type].unshift({ 
                    kanji: mat_truoc, 
                    hira: subParts[0] ? subParts[0].trim() : '', 
                    hv: subParts[1] ? subParts[1].trim() : '',
                    vn: subParts[2] ? subParts[2].trim() : '', 
                    ex_jp: subParts[3] ? subParts[3].trim() : '',
                    ex_vn: subParts[4] ? subParts[4].trim() : ''
                });
            } else if (type === "ngu_phap") {
                let subParts = mat_sau.split(',');
                database[lesson][type].unshift({
                    gram_pattern: mat_truoc,
                    gram_exp: subParts[0] ? subParts[0].trim() : '',
                    gram_exjp: subParts[1] ? subParts[1].trim() : '',
                    gram_exvn: subParts[2] ? subParts[2].trim() : ''
                });
            } else {
                database[lesson][type].unshift({ mat_truoc, mat_sau });
            }
            count++;
        }
    });
    localStorage.setItem("minnaData", JSON.stringify(database)); showToast(`✅ Đã thêm ${count} thẻ!`);
    document.getElementById("inpBulk").value = ""; hideAllPanels(); renderLessonSelect(); document.getElementById("selectLesson").value = lesson; renderCards();
}

/* --- LOGIC ÔN TẬP SRS (CHU KỲ CỐ ĐỊNH 1,3,7,14,30 NGÀY) --- */
const ABSOLUTE_INTERVALS = [1, 3, 7, 14, 30];

function markLessonReviewed() {
    const lesson = document.getElementById("selectLesson").value;
    if (!lesson || !database[lesson]) return;
    
    if (!database[lesson].srs_info) database[lesson].srs_info = { first_studied: null, last_studied: null, step: 0 };

    let srs = database[lesson].srs_info;
    let now = new Date().toISOString();
    
    if (srs.step === 0 || !srs.first_studied) srs.first_studied = srs.first_studied || srs.last_studied || now;
    if (srs.step >= 6) { showToast("🎉 Bài này đã Master, không cần ôn thêm!"); return; }

    srs.step++; srs.last_studied = now;
    localStorage.setItem("minnaData", JSON.stringify(database)); showToast("✅ Đã ghi nhận hoàn thành ôn tập!"); renderCards();
}

function resetLessonSRS() {
    const lesson = document.getElementById("selectLesson").value;
    if (!lesson || !database[lesson]) return;
    if (confirm("Reset tiến độ bài này về lúc ban đầu (Chưa học)?")) {
        database[lesson].srs_info = { first_studied: null, last_studied: null, step: 0 };
        localStorage.setItem("minnaData", JSON.stringify(database)); renderCards(); showToast("Đã reset tiến độ!");
    }
}

/* --- VẼ 3 BẢNG THỐNG KÊ LỊCH TRÌNH --- */
function renderStats() {
    const container = document.getElementById("statsContent");
    const currentLesson = document.getElementById("selectLesson").value;
    
    let today = new Date(); today.setHours(0,0,0,0);
    let tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    
    let html = "";

    // BẢNG 1
    html += `<h4 class="stats-heading">🗓️ Bảng 1: Lịch trình ôn tập Bài ${currentLesson || "Chưa chọn"}</h4>`;
    if (!currentLesson || !database[currentLesson]) {
        html += `<p style="text-align:center; color:#666;">Vui lòng chọn 1 bài học để xem lịch trình.</p>`;
    } else {
        let srs = database[currentLesson].srs_info || { first_studied: null, last_studied: null, step: 0 };
        html += `<div style="overflow-x:auto;"><table class="stats-table"><tr><th>Lần ôn</th><th>Chu kỳ</th><th>Ngày cần ôn</th><th>Trạng thái</th></tr>`;

        let baseDate = null;
        if (srs.first_studied) baseDate = new Date(srs.first_studied);
        else if (srs.last_studied) baseDate = new Date(srs.last_studied);
        if (baseDate) baseDate.setHours(0,0,0,0);

        let hocMoiStatus = srs.step > 0 ? "<span class='badge-green'>Đã xong</span>" : "<span class='badge-orange'>Chờ học</span>";
        let hocMoiDate = baseDate ? baseDate.toLocaleDateString('vi-VN') : "--/--/----";
        html += `<tr><td><b>Học mới</b></td><td>Bắt đầu</td><td>${hocMoiDate}</td><td>${hocMoiStatus}</td></tr>`;

        for (let i = 0; i < 5; i++) {
            let interval = ABSOLUTE_INTERVALS[i];
            let dateStr = "--/--/----"; let statusHtml = "<span style='color:#999'>Chưa tới</span>";

            if (baseDate) {
                let targetDate = new Date(baseDate); targetDate.setDate(targetDate.getDate() + interval);
                dateStr = targetDate.toLocaleDateString('vi-VN');

                if (srs.step > i + 1) { statusHtml = "<span class='badge-green'>Đã xong</span>"; } 
                else if (srs.step === i + 1) { 
                    if (today > targetDate) statusHtml = "<span class='badge-red'>Quá hạn!</span>";
                    else if (today.getTime() === targetDate.getTime()) statusHtml = "<span class='badge-orange'>Hôm nay</span>";
                    else statusHtml = "<span class='badge-green'>Chưa tới</span>";
                }
            }
            html += `<tr><td><b>Lần ${i+1}</b></td><td>Sau ${interval} ngày</td><td>${dateStr}</td><td>${statusHtml}</td></tr>`;
        }
        html += `</table></div>`;
    }

    let tasksToday = []; let tasksTomorrow = [];
    for (let lesson in database) {
        let srs = database[lesson].srs_info;
        if (!srs || (!srs.first_studied && !srs.last_studied)) continue; 
        if (srs.step >= 6 || srs.step === 0) continue; 

        let bDate = new Date(srs.first_studied || srs.last_studied); bDate.setHours(0,0,0,0);
        let interval = ABSOLUTE_INTERVALS[srs.step - 1];
        let targetDate = new Date(bDate); targetDate.setDate(targetDate.getDate() + interval);

        if (today >= targetDate) {
            let status = (today > targetDate) ? "Quá hạn!" : "Hôm nay";
            let colorClass = (today > targetDate) ? "badge-red" : "badge-orange";
            tasksToday.push({ lesson: lesson, status: status, colorClass: colorClass, cycle: 'Sau ' + interval + ' ngày', nextDateObj: targetDate });
        } else if (tomorrow.getTime() === targetDate.getTime()) {
            tasksTomorrow.push({ lesson: lesson, status: "Ngày mai", colorClass: "badge-blue", cycle: 'Sau ' + interval + ' ngày', nextDateObj: targetDate });
        }
    }

    // BẢNG 2
    html += `<h4 class="stats-heading" style="margin-top: 25px;">🎯 Bảng 2: Danh sách các bài cần ôn "Hôm nay"</h4>`;
    tasksToday.sort((a, b) => a.nextDateObj - b.nextDateObj);

    if(tasksToday.length === 0) {
        html += `<div style="text-align:center; padding: 15px; background:#e8f5e9; color:#2e7d32; border-radius:8px; font-weight:bold;">🎉 Tuyệt vời! Không có bài nào trễ hay cần ôn hôm nay.</div>`;
    } else {
        html += `<div style="overflow-x:auto;"><table class="stats-table"><tr><th>Bài</th><th>Trạng thái</th><th>Chu kỳ</th><th></th></tr>`;
        tasksToday.forEach(t => { html += `<tr><td><b>Bài ${t.lesson}</b></td><td><span class="${t.colorClass}">${t.status}</span></td><td>${t.cycle}</td><td><button class="btn-goto" onclick="gotoLesson('${t.lesson}')">Học ngay</button></td></tr>`; });
        html += `</table></div>`;
    }

    // BẢNG 3
    html += `<h4 class="stats-heading" style="margin-top: 25px;">🚀 Bảng 3: Danh sách các bài cần ôn "Ngày mai"</h4>`;
    tasksTomorrow.sort((a, b) => a.nextDateObj - b.nextDateObj);

    if(tasksTomorrow.length === 0) {
        html += `<div style="text-align:center; padding: 15px; background:#f5f5f5; color:#666; border-radius:8px;">Thảnh thơi! Ngày mai bạn chưa có lịch ôn tập nào.</div>`;
    } else {
        html += `<div style="overflow-x:auto;"><table class="stats-table"><tr><th>Bài</th><th>Trạng thái</th><th>Chu kỳ</th><th></th></tr>`;
        tasksTomorrow.forEach(t => { html += `<tr><td><b>Bài ${t.lesson}</b></td><td><span class="${t.colorClass}">${t.status}</span></td><td>${t.cycle}</td><td><button class="btn-goto-tomorrow" onclick="gotoLesson('${t.lesson}')">Xem trước</button></td></tr>`; });
        html += `</table></div>`;
    }
    container.innerHTML = html;
}

function gotoLesson(lesson) { document.getElementById("selectLesson").value = lesson; hideAllPanels(); renderCards(); window.scrollTo({ top: 0, behavior: 'smooth' }); }

/* --- HIỂN THỊ DỮ LIỆU CHÍNH & KHUNG TRẠNG THÁI SRS --- */
function renderCards() {
    const lesson = document.getElementById("selectLesson").value;
    const type = document.getElementById("selectType").value;
    const container = document.getElementById("contentArea");
    container.innerHTML = "";

    document.getElementById("vocabToolbar").style.display = (type === "tu_vung") ? "block" : "none";
    document.getElementById("grammarToolbar").style.display = (type === "ngu_phap") ? "block" : "none";

    if (!database[lesson] || !database[lesson][type] || database[lesson][type].length === 0) {
        return container.innerHTML = "<p style='text-align:center; color:#999; margin-top:30px; font-size:14px'>Chưa có dữ liệu.<br>Bấm + để thêm.</p>";
    }

    let srs = database[lesson].srs_info || { first_studied: null, last_studied: null, step: 0 };
    let lastDateStr = "Chưa bắt đầu", nextDateStr = "Chưa có", statusColor = "#757575";
    let chuKy = srs.step > 0 ? (srs.step >= 6 ? 'Đã Master 🎉' : 'Sau ' + ABSOLUTE_INTERVALS[Math.min(srs.step - 1, 4)] + ' ngày') : 'Sẵn sàng học';

    if (srs.first_studied || srs.last_studied) {
        let bDate = new Date(srs.first_studied || srs.last_studied); bDate.setHours(0,0,0,0);
        lastDateStr = new Date(srs.last_studied || srs.first_studied).toLocaleDateString('vi-VN');
        
        if (srs.step >= 6) { nextDateStr = "Đã hoàn thành khóa ôn!"; statusColor = "#1976D2"; } 
        else if (srs.step > 0) {
            let interval = ABSOLUTE_INTERVALS[srs.step - 1];
            let targetDate = new Date(bDate); targetDate.setDate(targetDate.getDate() + interval);
            nextDateStr = targetDate.toLocaleDateString('vi-VN');
            let today = new Date(); today.setHours(0,0,0,0);
            if (today > targetDate) { statusColor = "#c62828"; nextDateStr += " (Quá hạn!)"; }
            else if (today.getTime() === targetDate.getTime()) { statusColor = "#f57c00"; nextDateStr += " (Hôm nay)"; }
            else { statusColor = "#2e7d32"; }
        }
    }

    container.innerHTML += `
        <div class="srs-box" style="border-left-color: ${statusColor}">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-size:13px; color:#555;">Lần học cuối: <b style="color:#333">${lastDateStr}</b></div>
                    <div style="font-size:14px; color:${statusColor}; margin-top:4px;">Ôn tập tiếp theo: <b>${nextDateStr}</b></div>
                    <div style="font-size:12px; color:#888; margin-top:4px;">Chu kỳ hiện tại: <b style="color:#000">${chuKy}</b> <button class="btn-srs-reset" onclick="resetLessonSRS()">Reset</button></div>
                </div>
                <button class="btn-srs" onclick="markLessonReviewed()">Đã Ôn Tập ✓</button>
            </div>
        </div>`;

    if (type === "tu_vung") {
        container.innerHTML += `<div style="overflow-x: auto; padding: 0 15px;"><div class="grid-5-cols grid-header"><div>1. Kanji</div><div>2. Hiragana</div><div>3. Hán Việt</div><div>4. Tiếng Việt</div><div>5. Ví dụ</div></div></div>`;
    } else if (type === "ngu_phap") {
        container.innerHTML += `<div style="overflow-x: auto; padding: 0 15px;"><div class="grid-4-cols grid-header"><div>1. Ngữ pháp</div><div>2. Giải thích</div><div>3. Ví dụ JP</div><div>4. Ví dụ VN</div></div></div>`;
    }

    database[lesson][type].forEach((item, index) => {
        let obsClass = isGlobalObscured ? "obscured" : "";
        
        if (type === "tu_vung") {
            let k = item.kanji || item.mat_truoc || ""; 
            let h = item.hira || item.mat_sau || ""; 
            let hv = item.hv || ""; 
            let v = item.vn || ""; 
            let exjp = item.ex_jp || item.en || ""; 
            let exvn = item.ex_vn || "";

            let textToSpeak = h ? h : k; 
            textToSpeak = textToSpeak.replace(/'/g, "\\'").replace(/"/g, "&quot;");
            
            let exjpToSpeak = exjp.replace(/'/g, "\\'").replace(/"/g, "&quot;");

            container.innerHTML += `
                <div class="card card-vocab ${obsClass}" onclick="this.classList.toggle('obscured')">
                    <div class="btn-delete-card" onclick="event.stopPropagation(); deleteItem(${index})">✕</div>
                    <div class="grid-5-cols">
                        <div class="col-kanji">
                            <span class="card-index">${index + 1}.</span>${k} 
                            <button class="btn-speak" onclick="speakText('${textToSpeak}', event)" title="Nghe từ vựng">🔊</button>
                        </div>
                        <div class="col-hira">${h}</div>
                        <div class="col-hv">${hv}</div>
                        <div class="col-vn">${v}</div>
                        <div class="col-example">
                            ${exjp ? `<div class="ex-jp">${exjp} <button class="btn-speak" onclick="speakText('${exjpToSpeak}', event)" title="Nghe câu ví dụ">🔊</button></div>` : ''}
                            ${exvn ? `<div class="ex-vn">${exvn}</div>` : ''}
                        </div>
                    </div>
                </div>`;
        } else if (type === "ngu_phap") {
            let gp = item.gram_pattern || item.mat_truoc || ""; 
            let gexp = item.gram_exp || item.mat_sau || ""; 
            let gjp = item.gram_exjp || ""; 
            let gvn = item.gram_exvn || ""; 
            
            let textToSpeak = gjp ? gjp : gp;
            textToSpeak = textToSpeak.replace(/'/g, "\\'").replace(/"/g, "&quot;");

            container.innerHTML += `
                <div class="card card-vocab ${obsClass}" onclick="this.classList.toggle('obscured')">
                    <div class="btn-delete-card" onclick="event.stopPropagation(); deleteItem(${index})">✕</div>
                    <div class="grid-4-cols">
                        <div class="col-gram-pattern"><span class="card-index">${index + 1}.</span>${gp}</div>
                        <div class="col-gram-exp">${gexp}</div>
                        <div class="col-gram-exjp">
                            ${gjp} 
                            ${(gjp || gp) ? `<button class="btn-speak" onclick="speakText('${textToSpeak}', event)" title="Nghe phát âm">🔊</button>` : ''}
                        </div>
                        <div class="col-gram-exvn">${gvn}</div>
                    </div>
                </div>`;
        } else {
            container.innerHTML += `<div class="card"><div class="btn-delete-card" onclick="deleteItem(${index})">✕</div><div class="card-kana"><span class="card-index">${index + 1}.</span>${item.mat_truoc}</div><div class="card-mean">${item.mat_sau}</div></div>`;
        }
    });
}

function showToast(msg) {
    var x = document.getElementById("toast"); x.innerText = msg; x.className = "show";
    setTimeout(() => { x.className = x.className.replace("show", ""); }, 3000);
}

initApp();
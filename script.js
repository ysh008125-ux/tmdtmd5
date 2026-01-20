// --- LOGIN & USER STATE LOGIC ---
let currentUser = null;

function checkLogin() {
    const id = document.getElementById('login-id').value.trim();
    // Simplified logic: allow 'student1' to 'student30' with pw '1111'
    const isStudent = /^student([1-9]|[12][0-9]|30)$/.test(id);
    const pw = document.getElementById('login-pw').value;
    const app = document.getElementById('app');
    const loginScreen = document.getElementById('login-screen');
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');

    if (id === '1234' && pw === '1234') {
        // Admin
        currentUser = 'admin';
        loginScreen.style.display = 'none';
        app.classList.remove('hidden');
        userName.innerText = '관리자님';
        userRole.innerText = '선생님 모드';

    } else if (isStudent && pw === '1111') {
        // Student
        currentUser = id;
        loginScreen.style.display = 'none';
        app.classList.remove('hidden');
        userName.innerText = id + ' 학생';
        userRole.innerText = '수강생';

        // Load Checklist State for this user
        loadCheckState();

    } else {
        alert('아이디 또는 비밀번호를 확인해주세요.\n(학생: student1~30 / 1111, 관리자: 1234 / 1234)');
    }
}

function logout() {
    location.reload();
}

// --- CHECKLIST PERSISTENCE ---
function saveCheckState() {
    if (!currentUser) return;
    const checks = document.querySelectorAll('input[type="checkbox"]');
    const state = {};
    checks.forEach(chk => {
        state[chk.id] = chk.checked;
    });
    localStorage.setItem('checklist_' + currentUser, JSON.stringify(state));
}

function loadCheckState() {
    if (!currentUser) return;
    const saved = localStorage.getItem('checklist_' + currentUser);
    if (saved) {
        const state = JSON.parse(saved);
        for (const [id, checked] of Object.entries(state)) {
            const el = document.getElementById(id);
            if (el) el.checked = checked;
        }
    }
}

// --- WORKSHEET MODAL LOGIC ---
const worksheets = {
    'kwl': {
        title: 'K-W-L 표',
        desc: '주제에 대해 이미 아는 것(K), 알고 싶은 것(W), 배운 것(L)을 정리해봅니다.',
        html: `
            <div class="ws-grid-3">
                <div class="ws-col"><h4>K (What I Know)</h4><textarea placeholder="이미 알고 있는 내용을 적어보세요."></textarea></div>
                <div class="ws-col"><h4>W (What I Want to know)</h4><textarea placeholder="더 알고 싶은 내용을 질문으로 만들어보세요."></textarea></div>
                <div class="ws-col"><h4>L (What I Learned)</h4><textarea placeholder="수업 후 배운 내용을 정리해보세요."></textarea></div>
            </div>
        `
    },
    'mindmap': {
        title: '마인드맵 (Mind Map)',
        desc: '중심 주제를 가운데 두고 가지를 뻗어 나가며 생각을 확장해봅니다.',
        html: `
            <div style="text-align:center; height:100%; display:flex; flex-direction:column; gap:10px;">
                <input type="text" class="ws-list-input" placeholder="중심 주제 입력 (예: 나의 여행)" style="font-size:1.5rem; text-align:center;">
                <div style="flex:1; border:2px dashed #ddd; border-radius:10px; padding:20px; display:grid; grid-template-columns:1fr 1fr; gap:20px;">
                    <textarea placeholder="가지 1: 생각나는 단어들..."></textarea>
                    <textarea placeholder="가지 2: 연관된 이미지..."></textarea>
                    <textarea placeholder="가지 3: 구체적인 계획..."></textarea>
                    <textarea placeholder="가지 4: 자유로운 아이디어..."></textarea>
                </div>
            </div>
        `
    },
    'venn': {
        title: '비교/대조 (Venn Diagram)',
        desc: '두 대상의 공통점과 차이점을 찾아 정리해봅니다.',
        html: `
            <div class="ws-grid-3">
                <div class="ws-col"><h4>A 만의 특징</h4><textarea placeholder="예: 우리나라의 인사법"></textarea></div>
                <div class="ws-col"><h4>공통점 (교집합)</h4><textarea placeholder="두 문화의 비슷한 점"></textarea></div>
                <div class="ws-col"><h4>B 만의 특징</h4><textarea placeholder="예: 태국의 인사법"></textarea></div>
            </div>
        `
    },
    'char': {
        title: '인물 분석표',
        desc: '인물의 내면과 외면을 깊이 있게 탐구해봅니다.',
        html: `
            <div style="display:flex; gap:10px; height:100%;">
                <div class="ws-col" style="flex:1"><h4>외적 특징</h4><textarea placeholder="생김새, 옷차림, 행동 말투 등"></textarea></div>
                <div class="ws-col" style="flex:1"><h4>내적 특징</h4><textarea placeholder="성격, 가치관, 고민, 꿈 등"></textarea></div>
                <div class="ws-col" style="flex:1"><h4>내가 느낀 점</h4><textarea placeholder="이 사람을 보며 나는 어떤 생각이 들었나요?"></textarea></div>
            </div>
        `
    },
    'cause': {
        title: '원인과 결과 (Fishbone)',
        desc: '문제의 근본적인 원인을 찾아 해결책을 모색합니다.',
        html: `
            <div style="display:flex; flex-direction:column; height:100%; gap:10px;">
                <input type="text" class="ws-list-input" placeholder="문제 상황 (Result) 입력">
                <div class="ws-grid-3" style="flex:1;">
                    <div class="ws-col"><h4>원인 1 (환경)</h4><textarea></textarea></div>
                    <div class="ws-col"><h4>원인 2 (사람)</h4><textarea></textarea></div>
                    <div class="ws-col"><h4>원인 3 (소통)</h4><textarea></textarea></div>
                </div>
            </div>
        `
    },
    'flow': {
        title: '사건 흐름도 (Flow Chart)',
        desc: '시간의 흐름이나 사건의 순서대로 내용을 정리합니다.',
        html: `
             <div style="display:flex; flex-direction:column; gap:10px; height:100%; overflow-y:auto;">
                <input type="text" class="ws-list-input" placeholder="1단계 (처음): ">
                <input type="text" class="ws-list-input" placeholder="2단계 (전개): ">
                <input type="text" class="ws-list-input" placeholder="3단계 (위기): ">
                <input type="text" class="ws-list-input" placeholder="4단계 (절정): ">
                <input type="text" class="ws-list-input" placeholder="5단계 (결말): ">
            </div>
        `
    },
    'tree': {
        title: '개념 구조도 (Structure Tree)',
        desc: '핵심 개념을 중심으로 하위 내용을 체계적으로 분류합니다.',
        html: `
            <div style="height:100%; display:flex; flex-direction:column; gap:10px;">
                <input type="text" class="ws-list-input" placeholder="대주제 (책 제목)" style="text-align:center; font-weight:bold;">
                <div style="display:flex; gap:10px; flex:1;">
                    <div class="ws-col" style="flex:1"><h4>Chapter 1</h4><textarea></textarea></div>
                    <div class="ws-col" style="flex:1"><h4>Chapter 2</h4><textarea></textarea></div>
                    <div class="ws-col" style="flex:1"><h4>Chapter 3</h4><textarea></textarea></div>
                </div>
            </div>
        `
    },
    'predict': {
        title: '표지 및 제목 추리',
        desc: '단서를 통해 내용을 예측하며 상상력을 발휘해봅니다.',
        html: `
            <div class="ws-grid-3">
                 <div class="ws-col"><h4>단서 찾기</h4><textarea placeholder="표지의 그림, 제목의 글자체 등에서 힌트를 찾아보세요."></textarea></div>
                 <div class="ws-col"><h4>내용 상상하기</h4><textarea placeholder="어떤 이야기가 펼쳐질까요?"></textarea></div>
                 <div class="ws-col"><h4>질문 만들기</h4><textarea placeholder="작가에게 궁금한 점은?"></textarea></div>
            </div>
        `
    }
};

function openWorksheet(type) {
    const modal = document.getElementById('worksheet-modal');
    const body = document.getElementById('worksheet-body');
    const ws = worksheets[type];

    if (ws) {
        body.innerHTML = `
            <div class="ws-title">${ws.title}</div>
            <p class="ws-desc">${ws.desc}</p>
            ${ws.html}
        `;
        modal.classList.remove('hidden');
    }
}

function closeWorksheet() {
    document.getElementById('worksheet-modal').classList.add('hidden');
}


// --- CHATBOT & UI LOGIC (Existing preserved/merged) ---
function toggleChat() {
    document.getElementById('chat-window').classList.toggle('hidden');
}

function handleEnter(e) { if (e.key === 'Enter') sendMsg(); }

function sendMsg() {
    const input = document.getElementById('chat-input');
    const txt = input.value.trim();
    if (!txt) return;
    addMessage(txt, 'user-msg');
    input.value = '';
    setTimeout(() => {
        addMessage(getBotResponse(txt), 'bot-msg');
    }, 600);
}

function addMessage(text, cls) {
    const body = document.getElementById('chat-body');
    const div = document.createElement('div');
    div.className = `msg ${cls}`;
    div.innerText = text;
    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function getBotResponse(txt) {
    txt = txt.toLowerCase();
    if (txt.includes('안녕')) return "안녕하세요! 여행 멘토입니다. 무엇을 도와드릴까요?";
    if (txt.includes('1단원')) return "1단원은 '나'를 돌아보는 시간이에요. 인생 여행 그래프를 그려보셨나요?";
    if (txt.includes('체크리스트')) return "체크리스트는 수행평가와 직결되니 꼼꼼히 채워주세요!";
    return "좋은 질문이네요! 씽킹 툴을 사용해서 생각을 더 깊게 정리해보는 건 어떨까요?";
}

function switchTab(tabId) {
    document.querySelectorAll('.nav-links li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Tab mapping (simplified)
    const map = { 'home': 0, 'unit1': 1, 'unit2': 2, 'unit3': 3, 'unit4': 4 };
    document.querySelectorAll('.nav-links li')[map[tabId]].classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

function startGame(type) {
    alert("Unit 1 탭으로 이동해서 테스트를 진행해주세요!");
    switchTab('unit1');
}

function u1Answer(type) {
    const r = document.getElementById('u1-result');
    r.classList.remove('hidden');
    r.innerHTML = type === 'J' ? "나노 단위 계획러! 🔍" : "자유로운 영혼! 🌬️";
}
function u2Answer(isO) {
    const r = document.getElementById('u2-result');
    r.classList.remove('hidden');
    r.innerHTML = isO ? "땡! ❌ 태국에선 머리를 만지면 안돼요." : "정답! ⭕ 머리는 신성한 부위랍니다.";
}
function u3Check() {
    const v = document.getElementById('u3-select').value;
    const f = document.getElementById('u3-feedback');
    if (v == 'B') f.innerHTML = "현명한 타협입니다! 👍";
    else if (v == '0') f.innerText = "선택해주세요.";
    else f.innerHTML = "조금 더 좋은 방법이 있을까요? 🤔";
}
function updateBook() {
    document.getElementById('preview-title').innerText = document.getElementById('input-title').value || "나의 여행";
    document.getElementById('preview-author').innerText = "지은이: " + (document.getElementById('input-author').value || "나");
}
function changeColor(c) {
    document.getElementById('book-preview').style.background = c;
}

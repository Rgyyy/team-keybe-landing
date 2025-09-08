let lastFetchTime = null;
let cachedData = null;

// 페이지 로드시 저장된 API 키 복원
document.addEventListener('DOMContentLoaded', function () {
    const savedApiKey = localStorage.getItem('exchangeApiKey');
    if (savedApiKey) {
        document.getElementById('apiKey').value = savedApiKey;
    }

    // 저장된 환율 데이터 복원
    const savedData = localStorage.getItem('cachedExchangeData');
    const savedTime = localStorage.getItem('lastFetchTime');
    if (savedData && savedTime) {
        cachedData = JSON.parse(savedData);
        lastFetchTime = new Date(savedTime);
        displayCachedData();
    }
});

function openModal() {
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('exchangeModal');

    overlay.classList.add('active');
    modal.classList.add('active');

    // 바디 스크롤 방지
    document.body.style.overflow = 'hidden';

    // 캐시된 데이터가 있고 5분 이내라면 표시
    if (cachedData && lastFetchTime) {
        const now = new Date();
        const diff = (now - lastFetchTime) / (1000 * 60); // 분 단위
        if (diff < 5) {
            displayExchangeData(cachedData, true);
        }
    }
}

function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('exchangeModal');

    overlay.classList.remove('active');
    modal.classList.remove('active');

    // 바디 스크롤 복원
    document.body.style.overflow = '';
}

function handleKeyPress(event) {
    if (event.key === 'Enter') {
        fetchExchangeRate();
    }
}

async function fetchExchangeRate() {
    const apiKey = document.getElementById('apiKey').value.trim();
    const dataDiv = document.getElementById('exchangeData');
    const fetchBtn = document.getElementById('fetchBtn');
    const floatingBtn = document.getElementById('floatingBtn');

    if (!apiKey) {
        dataDiv.innerHTML = '<div class="error">API 키를 입력해주세요.</div>';
        return;
    }

    // API 키 저장
    localStorage.setItem('exchangeApiKey', apiKey);

    // 로딩 상태
    dataDiv.innerHTML = '<div class="loading">💫 환율 정보를 불러오는 중...</div>';
    fetchBtn.disabled = true;
    fetchBtn.textContent = '조회 중...';
    floatingBtn.classList.add('loading');

    try {
        const today = new Date();
        const searchDate = today.toISOString().split('T')[0].replace(/-/g, '');

        const url = `https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${apiKey}&searchdate=${searchDate}&data=AP01`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP 오류: ${response.status}`);
        }

        const data = await response.json();

        if (!data || data.length === 0) {
            // 어제 날짜로 재시도
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split('T')[0].replace(/-/g, '');

            const retryUrl = `https://oapi.koreaexim.go.kr/site/program/financial/exchangeJSON?authkey=${apiKey}&searchdate=${yesterdayStr}&data=AP01`;
            const retryResponse = await fetch(retryUrl);
            const retryData = await retryResponse.json();

            if (!retryData || retryData.length === 0) {
                throw new Error('환율 데이터를 찾을 수 없습니다.');
            }

            displayExchangeData(retryData);
            cachedData = retryData;
        } else {
            displayExchangeData(data);
            cachedData = data;
        }

        lastFetchTime = new Date();

        // 데이터 캐싱
        localStorage.setItem('cachedExchangeData', JSON.stringify(cachedData));
        localStorage.setItem('lastFetchTime', lastFetchTime.toISOString());

        dataDiv.innerHTML += '<div class="success">✅ 최신 환율 정보를 가져왔습니다!</div>';

    } catch (error) {
        console.error('환율 조회 오류:', error);

        let errorMessage = '❌ 환율 정보를 가져올 수 없습니다.';
        if (error.message.includes('401')) {
            errorMessage += '<br><small>API 키를 확인해주세요.</small>';
        } else if (error.message.includes('CORS') || error.message.includes('네트워크')) {
            errorMessage += '<br><small>네트워크 연결을 확인해주세요.</small>';
        }

        dataDiv.innerHTML = `<div class="error">${errorMessage}</div>`;

        // 캐시된 데이터라도 보여주기
        if (cachedData) {
            displayCachedData();
        }

    } finally {
        fetchBtn.disabled = false;
        fetchBtn.textContent = '환율 조회';
        floatingBtn.classList.remove('loading');
    }
}

function displayExchangeData(data, isCache = false) {
    const dataDiv = document.getElementById('exchangeData');

    // 주요 통화만 필터링 (USD, EUR, JPY, CNY, GBP)
    const majorCurrencies = ['USD', 'EUR', 'JPY(100)', 'CNY', 'GBP'];
    const filteredData = data.filter(item =>
        majorCurrencies.includes(item.cur_unit)
    );

    let html = '<div class="exchange-grid fade-in">';

    filteredData.forEach(item => {
        const rate = parseFloat(item.deal_bas_r);
        const formattedRate = rate ? rate.toLocaleString('ko-KR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }) : '-';

        let currencySymbol = '';
        switch (item.cur_unit) {
            case 'USD': currencySymbol = '🇺🇸'; break;
            case 'EUR': currencySymbol = '🇪🇺'; break;
            case 'JPY(100)': currencySymbol = '🇯🇵'; break;
            case 'CNY': currencySymbol = '🇨🇳'; break;
            case 'GBP': currencySymbol = '🇬🇧'; break;
            default: currencySymbol = '💱';
        }

        html += `
          <div class="currency-card">
            <div class="currency-header">
              <div>
                <div class="currency-code">${currencySymbol} ${item.cur_unit}</div>
                <div class="currency-name">${item.cur_nm}</div>
              </div>
              <div class="exchange-rate">₩${formattedRate}</div>
            </div>
          </div>
        `;
    });

    // 전체 통화도 보여주기 (축약형)
    if (data.length > filteredData.length) {
        const remainingCount = data.length - filteredData.length;
        html += `
          <div class="currency-card" onclick="showAllCurrencies()" style="cursor: pointer; opacity: 0.7;">
            <div class="currency-header">
              <div>
                <div class="currency-code">+ ${remainingCount}개</div>
                <div class="currency-name">더 많은 통화 보기</div>
              </div>
              <div class="exchange-rate">👆</div>
            </div>
          </div>
        `;
    }

    html += '</div>';

    if (isCache) {
        html += '<div class="last-updated">💾 캐시된 데이터 (5분 이내)</div>';
    } else {
        html += `<div class="last-updated">🕒 ${new Date().toLocaleString('ko-KR')}</div>`;
    }

    dataDiv.innerHTML = html;
}

function displayCachedData() {
    if (cachedData) {
        const dataDiv = document.getElementById('exchangeData');
        dataDiv.innerHTML = '<div class="success">💾 저장된 환율 정보를 표시합니다.</div>';
        displayExchangeData(cachedData, true);
    }
}

function showAllCurrencies() {
    if (cachedData) {
        displayExchangeData(cachedData.slice(0, -1), true); // 마지막 요소 제외하고 모두 표시
        const dataDiv = document.getElementById('exchangeData');
        dataDiv.innerHTML += '<div class="success">📋 전체 통화 정보를 표시합니다.</div>';
    }
}

// 터치 제스처로 모달 닫기
let startY = 0;
let currentY = 0;

document.getElementById('exchangeModal').addEventListener('touchstart', function (e) {
    startY = e.touches[0].clientY;
});

document.getElementById('exchangeModal').addEventListener('touchmove', function (e) {
    currentY = e.touches[0].clientY;
    const diff = currentY - startY;

    if (diff > 0 && diff < 100) {
        this.style.transform = `translateY(${diff}px)`;
    }
});

document.getElementById('exchangeModal').addEventListener('touchend', function (e) {
    const diff = currentY - startY;

    if (diff > 100) {
        closeModal();
    }

    this.style.transform = '';
    startY = 0;
    currentY = 0;
});
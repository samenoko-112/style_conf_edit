// グローバル変数
let currentConfig = {};
let originalConfig = {};

// DOM要素の取得
const fileInput = document.getElementById('fileInput');
const loadFileBtn = document.getElementById('loadFile');
const saveFileBtn = document.getElementById('saveFile');
const resetChangesBtn = document.getElementById('resetChanges');
const navTabs = document.querySelectorAll('.nav-tab');
const sections = document.querySelectorAll('.section');

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeEventListeners();
    loadDefaultConfig();
    updatePreview();
    
    // 初期化後にグラデーションプレビューを更新
    setTimeout(() => {
        updateAllGradientPreviews();
    }, 100);
});

// イベントリスナーの初期化
function initializeEventListeners() {
    // ファイル読み込み
    loadFileBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileLoad);
    
    // ファイル保存
    saveFileBtn.addEventListener('click', handleFileSave);
    
    // 変更リセット
    resetChangesBtn.addEventListener('click', resetChanges);
    
    // タブ切り替え
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => switchTab(tab.dataset.section));
    });
    
    // 設定変更の監視
    document.addEventListener('input', handleSettingChange);
    document.addEventListener('change', handleSettingChange);
}

// デフォルト設定の読み込み
function loadDefaultConfig() {
    const defaultConfig = {
        Font: {
            DefaultFamily: 'Yu Gothic UI',
            Control: '13',
            EditControl: '13,Consolas',
            PreviewTime: '16',
            LayerObject: '16',
            TimeGauge: '13',
            Footer: '14',
            TextEdit: '16,Consolas',
            Log: '12,Consolas'
        },
        Color: {
            Background: '202020',
            WindowBorder: '585858',
            WindowSeparator: '000000',
            Footer: '304080',
            FooterProgress: '903838,b84848',
            Grouping: '383838',
            GroupingHover: '404040',
            GroupingSelect: '484848',
            TitleHeader: '404040',
            BorderSelect: 'e0e0e0',
            Border: '909090',
            BorderFocus: '8080e0',
            Text: 'ffffff',
            TextDisable: '909090',
            TextSelect: '6060e0',
            ButtonBody: '606060',
            ButtonBodyHover: '808080',
            ButtonBodyPress: 'a0a0a0',
            ButtonBodyDisable: '484848',
            ButtonBodySelect: '7070c0',
            SliderCursor: 'b88070',
            TrackBarRange: '282828',
            ZoomGauge: '60a0ff',
            ZoomGaugeHover: '80c0ff',
            ZoomGaugeOff: '204080',
            ZoomGaugeOffHover: '3060a0',
            FrameCursor: 'c83030e0',
            FrameCursorWide: 'c8303080',
            PlayerCursor: 'e0e080e0',
            GuideLine: '606060c0',
            Layer: '404040',
            LayerHeader: '4a4a4a',
            LayerHover: '585858',
            LayerDisable: '343434',
            LayerRange: '70707038',
            LayerRangeFrame: '707070c8',
            ObjectVideo: '3040e0,2030c0',
            ObjectVideoSelect: '5060f0',
            ObjectAudio: 'd04030,b83020',
            ObjectAudioSelect: 'e06050',
            ObjectControl: '30b0c0,2090a0',
            ObjectControlSelect: '50c0d0',
            ObjectVideoFilter: '30b030,209020',
            ObjectVideoFilterSelect: '50c050',
            ObjectAudioFilter: 'b8b030,989020',
            ObjectAudioFilterSelect: 'c8c050',
            ObjectHover: 'ffffffa0',
            ObjectFocus: 'c0c0c0',
            ObjectSection: 'a0a0a0',
            ClippingObject: '00e0e0',
            ClippingObjectMask: '00e0e040',
            Anchor: 'c0c0c0',
            AnchorLine: 'ffffff80',
            AnchorIn: 'a0ffa0',
            AnchorOut: 'ffa0a0',
            AnchorHover: 'ffffff80',
            AnchorSelect: 'c8c8c8',
            AnchorEdge: '00000080',
            CenterGroup: '60c060',
            HandleX: 'f05050',
            HandleY: '208020',
            HandleZ: '5050f0',
            HandleXHover: 'ffa0a0',
            HandleYHover: '70b070',
            HandleZHover: 'a0a0ff',
            OutsideDisplay: '404040'
        },
        Layout: {
            WindowSeparatorSize: '7',
            ScrollBarSize: '20',
            FooterHeight: '24',
            TitleHeaderHeight: '18',
            TimeGaugeHeight: '32',
            LayerHeight: '32',
            LayerHeaderWidth: '96',
            SettingItemHeaderWidth: '96',
            SettingItemHeight: '22',
            SettingItemMarginWidth: '6',
            SettingHeaderHeight: '48',
            PlayerControlHeight: '46',
            ExplorerHeaderHeight: '28',
            ExplorerWindowNum: '4',
            ListItemHeight: '26'
        },
        Format: {
            FooterLeft: '{CurrentTime} / {TotalTime}  |  {CurrentFrame} / {TotalFrame}',
            FooterRight: '{SceneName}  |  {Resolution}  |  {FrameRate}  |  {SamplingRate}'
        }
    };
    
    currentConfig = JSON.parse(JSON.stringify(defaultConfig));
    originalConfig = JSON.parse(JSON.stringify(defaultConfig));
    updateFormValues();
}

// ファイル読み込み処理
function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const content = e.target.result;
            const config = parseConfigFile(content);
            currentConfig = config;
            originalConfig = JSON.parse(JSON.stringify(config));
            updateFormValues();
            updatePreview();
            showNotification('ファイルを読み込みました', 'success');
        } catch (error) {
            showNotification('ファイルの読み込みに失敗しました', 'error');
            console.error('File load error:', error);
        }
    };
    reader.readAsText(file, 'UTF-8');
}

// ファイル保存処理
function handleFileSave() {
    try {
        const content = generateConfigFile();
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'style.conf';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showNotification('ファイルを保存しました', 'success');
    } catch (error) {
        showNotification('ファイルの保存に失敗しました', 'error');
        console.error('File save error:', error);
    }
}

// 設定ファイルの解析
function parseConfigFile(content) {
    const config = {
        Font: {},
        Color: {},
        Layout: {},
        Format: {}
    };
    
    let currentSection = '';
    const lines = content.split('\n');
    
    for (let line of lines) {
        line = line.trim();
        
        // セクション開始
        if (line.startsWith('[') && line.endsWith(']')) {
            currentSection = line.slice(1, -1);
            continue;
        }
        
        // コメントまたは空行をスキップ
        if (line.startsWith(';') || line === '') {
            continue;
        }
        
        // キー=値の解析
        const equalIndex = line.indexOf('=');
        if (equalIndex > 0) {
            const key = line.substring(0, equalIndex).trim();
            const value = line.substring(equalIndex + 1).trim();
            
            if (currentSection === 'Font') {
                config.Font[key] = value;
            } else if (currentSection === 'Color') {
                config.Color[key] = value;
            } else if (currentSection === 'Layout') {
                config.Layout[key] = value;
            } else if (currentSection === 'Format') {
                config.Format[key] = value;
            }
        }
    }
    
    return config;
}

// 設定ファイルの生成
function generateConfigFile() {
    let content = '; 外観の設定\n';
    content += '; UTF-8で記述する\n';
    content += '; ProgramData\\aviutl2\\style.confで設定を上書き出来る\n\n';
    
    // Font セクション
    content += '[Font]\n';
    for (const [key, value] of Object.entries(currentConfig.Font)) {
        content += `${key}=${value}\n`;
    }
    content += '\n';
    
    // Color セクション
    content += '[Color]\n';
    for (const [key, value] of Object.entries(currentConfig.Color)) {
        content += `${key}=${value}\n`;
    }
    content += '\n';
    
    // Layout セクション
    content += '[Layout]\n';
    for (const [key, value] of Object.entries(currentConfig.Layout)) {
        content += `${key}=${value}\n`;
    }
    content += '\n';
    
    // Format セクション
    content += '[Format]\n';
    for (const [key, value] of Object.entries(currentConfig.Format)) {
        content += `${key}=${value}\n`;
    }
    
    return content;
}

// フォーム値の更新
function updateFormValues() {
    // Font セクション
    Object.entries(currentConfig.Font).forEach(([key, value]) => {
        const element = document.querySelector(`[data-key="${key}"]`);
        if (element) {
            element.value = value;
        }
    });
    
    // Color セクション
    Object.entries(currentConfig.Color).forEach(([key, value]) => {
        const elements = document.querySelectorAll(`[data-key="${key}"]`);
        if (elements.length > 0) {
            if (value.includes(',')) {
                // グラデーション値
                const colors = value.split(',');
                elements.forEach((element, index) => {
                    if (index < colors.length) {
                        const color = colors[index];
                        if (element.type === 'color') {
                            element.value = `#${color}`;
                        } else if (element.classList.contains('color-hex')) {
                            element.value = color;
                        }
                    }
                });
                
                // グラデーションプレビューの更新
                updateGradientPreview(key, colors);
            } else {
                // 単色値
                elements.forEach(element => {
                    if (element.type === 'color') {
                        element.value = `#${value}`;
                    } else if (element.classList.contains('color-hex')) {
                        element.value = value;
                    }
                });
            }
        }
    });
    
    // Layout セクション
    Object.entries(currentConfig.Layout).forEach(([key, value]) => {
        const element = document.querySelector(`[data-key="${key}"]`);
        if (element) {
            element.value = value;
        }
    });
    
    // Format セクション
    Object.entries(currentConfig.Format).forEach(([key, value]) => {
        const element = document.querySelector(`[data-key="${key}"]`);
        if (element) {
            element.value = value;
        }
    });
}

// 設定変更の処理
function handleSettingChange(event) {
    const element = event.target;
    const key = element.dataset.key;
    const section = element.dataset.section;
    const index = element.dataset.index;
    
    if (!key) return;
    
    let value = element.value;
    
    // カラーピッカーの場合
    if (element.type === 'color') {
        value = value.substring(1); // #を除去
        const hexInput = element.parentElement.querySelector('.color-hex');
        if (hexInput) {
            hexInput.value = value.toUpperCase();
        }
    }
    
    // 16進数入力の場合
    if (element.classList.contains('color-hex')) {
        value = value.toUpperCase();
        const colorInput = element.parentElement.querySelector('input[type="color"]');
        if (colorInput) {
            colorInput.value = `#${value}`;
        }
    }
    
    // グラデーション値の処理
    if (index !== undefined) {
        const gradientKey = key;
        const currentValue = currentConfig.Color[gradientKey] || '';
        const colors = currentValue.split(',');
        colors[index] = value;
        currentConfig.Color[gradientKey] = colors.join(',');
        
        // グラデーションプレビューの更新
        updateGradientPreview(gradientKey, colors);
    } else {
        // 通常の値の処理
        if (element.closest('#font')) {
            currentConfig.Font[key] = value;
        } else if (element.closest('#color')) {
            currentConfig.Color[key] = value;
        } else if (element.closest('#layout')) {
            currentConfig.Layout[key] = value;
        } else if (element.closest('#format')) {
            currentConfig.Format[key] = value;
        }
    }
    
    updatePreview();
}

// グラデーションプレビューの更新
function updateGradientPreview(key, colors) {
    const gradientGroup = document.querySelector(`[data-key="${key}"]`).closest('.gradient-input-group');
    if (gradientGroup && colors.length >= 2) {
        gradientGroup.style.setProperty('--gradient-start', `#${colors[0]}`);
        gradientGroup.style.setProperty('--gradient-end', `#${colors[1]}`);
    }
    
    // プレビューパネルの更新も同時に行う
    updateColorPreview();
}

// すべてのグラデーションプレビューを更新
function updateAllGradientPreviews() {
    const gradientKeys = [
        'FooterProgress',
        'ObjectVideo',
        'ObjectAudio',
        'ObjectControl',
        'ObjectVideoFilter',
        'ObjectAudioFilter'
    ];
    
    gradientKeys.forEach(key => {
        if (currentConfig.Color[key]) {
            const colors = currentConfig.Color[key].split(',');
            if (colors.length >= 2) {
                updateGradientPreview(key, colors);
            }
        }
    });
}

// タブ切り替え
function switchTab(sectionName) {
    // アクティブタブの更新
    navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.section === sectionName);
    });
    
    // セクションの表示切り替え
    sections.forEach(section => {
        section.classList.toggle('active', section.id === sectionName);
    });
}

// 変更のリセット
function resetChanges() {
    if (confirm('変更をリセットしますか？')) {
        currentConfig = JSON.parse(JSON.stringify(originalConfig));
        updateFormValues();
        updatePreview();
        showNotification('変更をリセットしました', 'info');
    }
}

// プレビューの更新
function updatePreview() {
    updateColorPreview();
}

// カラープレビューの更新
function updateColorPreview() {
    // 背景色
    const previewBackground = document.getElementById('previewBackground');
    if (previewBackground && currentConfig.Color.Background) {
        previewBackground.style.backgroundColor = `#${currentConfig.Color.Background}`;
    }
    
    // テキスト色
    const previewText = document.getElementById('previewText');
    if (previewText && currentConfig.Color.Text) {
        previewText.style.backgroundColor = `#${currentConfig.Color.Text}`;
    }
    
    // ボタン色
    const previewButton = document.getElementById('previewButton');
    if (previewButton && currentConfig.Color.ButtonBody) {
        previewButton.style.backgroundColor = `#${currentConfig.Color.ButtonBody}`;
    }
    
    // レイヤー色
    const previewLayer = document.getElementById('previewLayer');
    if (previewLayer && currentConfig.Color.Layer) {
        previewLayer.style.backgroundColor = `#${currentConfig.Color.Layer}`;
    }
    
    // フッター色
    const previewFooter = document.getElementById('previewFooter');
    if (previewFooter && currentConfig.Color.Footer) {
        previewFooter.style.backgroundColor = `#${currentConfig.Color.Footer}`;
    }
    
    // 映像オブジェクト色（グラデーション）
    const previewObjectVideo = document.getElementById('previewObjectVideo');
    if (previewObjectVideo && currentConfig.Color.ObjectVideo) {
        const colors = currentConfig.Color.ObjectVideo.split(',');
        if (colors.length >= 2) {
            previewObjectVideo.style.background = `linear-gradient(135deg, #${colors[0]}, #${colors[1]})`;
        }
    }
    
    // 音声オブジェクト色（グラデーション）
    const previewObjectAudio = document.getElementById('previewObjectAudio');
    if (previewObjectAudio && currentConfig.Color.ObjectAudio) {
        const colors = currentConfig.Color.ObjectAudio.split(',');
        if (colors.length >= 2) {
            previewObjectAudio.style.background = `linear-gradient(135deg, #${colors[0]}, #${colors[1]})`;
        }
    }
    
    // 制御オブジェクト色（グラデーション）
    const previewObjectControl = document.getElementById('previewObjectControl');
    if (previewObjectControl && currentConfig.Color.ObjectControl) {
        const colors = currentConfig.Color.ObjectControl.split(',');
        if (colors.length >= 2) {
            previewObjectControl.style.background = `linear-gradient(135deg, #${colors[0]}, #${colors[1]})`;
        }
    }
    
    // 映像フィルタオブジェクト色（グラデーション）
    const previewObjectVideoFilter = document.getElementById('previewObjectVideoFilter');
    if (previewObjectVideoFilter && currentConfig.Color.ObjectVideoFilter) {
        const colors = currentConfig.Color.ObjectVideoFilter.split(',');
        if (colors.length >= 2) {
            previewObjectVideoFilter.style.background = `linear-gradient(135deg, #${colors[0]}, #${colors[1]})`;
        }
    }
    
    // 音声フィルタオブジェクト色（グラデーション）
    const previewObjectAudioFilter = document.getElementById('previewObjectAudioFilter');
    if (previewObjectAudioFilter && currentConfig.Color.ObjectAudioFilter) {
        const colors = currentConfig.Color.ObjectAudioFilter.split(',');
        if (colors.length >= 2) {
            previewObjectAudioFilter.style.background = `linear-gradient(135deg, #${colors[0]}, #${colors[1]})`;
        }
    }
    
    // フッター進捗色（グラデーション）
    const previewFooterProgress = document.getElementById('previewFooterProgress');
    if (previewFooterProgress && currentConfig.Color.FooterProgress) {
        const colors = currentConfig.Color.FooterProgress.split(',');
        if (colors.length >= 2) {
            previewFooterProgress.style.background = `linear-gradient(135deg, #${colors[0]}, #${colors[1]})`;
        }
    }
}

// 通知の表示
function showNotification(message, type = 'info') {
    // 既存の通知を削除
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // 新しい通知を作成
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="ti ti-${type === 'success' ? 'check' : type === 'error' ? 'x' : 'info'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // スタイルを適用
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'linear-gradient(135deg, #11998e, #38ef7d)' : 
                     type === 'error' ? 'linear-gradient(135deg, #f093fb, #f5576c)' : 
                     'linear-gradient(135deg, #667eea, #764ba2)'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    // 3秒後に自動削除
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// 通知アニメーション用CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style); 
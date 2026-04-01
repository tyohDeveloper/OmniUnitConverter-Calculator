export const SUPPORTED_LANGUAGES = [
  'en',
  'en-us',
  'ar',
  'de',
  'es',
  'fr',
  'it',
  'ja',
  'ko',
  'pt',
  'ru',
  'zh',
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface Translation {
  en: string;
  ar: string;
  de?: string;
  es?: string;
  fr?: string;
  it?: string;
  ja?: string;
  ko?: string;
  pt?: string;
  ru?: string;
  zh?: string;
}

export const UI_TRANSLATIONS: Record<string, Translation> = {
  'Base Quantities': { 
    en: 'Base Quantities', ar: 'الكميات الأساسية', de: 'Basisgrößen',
    es: 'Cantidades Base', fr: 'Grandeurs de Base', it: 'Grandezze di Base',
    pt: 'Grandezas Base', ru: 'Базовые Величины', zh: '基本量', ja: '基本量', ko: '기본량'
  },
  'Mechanics': { 
    en: 'Mechanics', ar: 'الميكانيكا', de: 'Mechanik',
    es: 'Mecánica', fr: 'Mécanique', it: 'Meccanica',
    pt: 'Mecânica', ru: 'Механика', zh: '力学', ja: '力学', ko: '역학'
  },
  'Electricity & Magnetism': { 
    en: 'Electricity & Magnetism', ar: 'الكهرباء والمغناطيسية', de: 'Elektrizität & Magnetismus',
    es: 'Electricidad y Magnetismo', fr: 'Électricité et Magnétisme', it: 'Elettricità e Magnetismo',
    pt: 'Eletricidade e Magnetismo', ru: 'Электричество и Магнетизм', zh: '电磁学', ja: '電気と磁気', ko: '전기와 자기'
  },
  'Light & Radiation': {
    en: 'Light & Radiation', ar: 'الضوء والإشعاع', de: 'Licht & Strahlung',
    es: 'Luz y Radiación', fr: 'Lumière et Rayonnement', it: 'Luce e Radiazione',
    pt: 'Luz e Radiação', ru: 'Свет и Излучение', zh: '光与辐射', ja: '光と放射', ko: '빛과 방사선'
  },
  'Thermodynamics': {
    en: 'Thermodynamics', ar: 'الديناميكا الحرارية', de: 'Thermodynamik',
    es: 'Termodinámica', fr: 'Thermodynamique', it: 'Termodinamica',
    pt: 'Termodinâmica', ru: 'Термодинамика', zh: '热力学', ja: '熱力学', ko: '열역학'
  },
  'Acoustics': {
    en: 'Acoustics', ar: 'الصوتيات', de: 'Akustik',
    es: 'Acústica', fr: 'Acoustique', it: 'Acustica',
    pt: 'Acústica', ru: 'Акустика', zh: '声学', ja: '音響学', ko: '음향학'
  },
  'Chemistry & Nuclear': {
    en: 'Chemistry & Nuclear', ar: 'الكيمياء والنووية', de: 'Chemie & Nuklear',
    es: 'Química y Nuclear', fr: 'Chimie et Nucléaire', it: 'Chimica e Nucleare',
    pt: 'Química e Nuclear', ru: 'Химия и Ядерная', zh: '化学与核', ja: '化学と原子力', ko: '화학과 원자력'
  },
  'Data & Digital': {
    en: 'Data & Digital', ar: 'البيانات والرقمية', de: 'Daten & Digital',
    es: 'Datos y Digital', fr: 'Données et Numérique', it: 'Dati e Digitale',
    pt: 'Dados e Digital', ru: 'Данные и Цифровые', zh: '数据与数字', ja: 'データとデジタル', ko: '데이터와 디지털'
  },
  'Industrial & Specialty': {
    en: 'Industrial & Specialty', ar: 'الصناعة والتخصص', de: 'Industrie & Spezial',
    es: 'Industrial y Especialidad', fr: 'Industrie et Spécialité', it: 'Industriale e Specialità',
    pt: 'Industrial e Especialidade', ru: 'Промышленность и Специальные', zh: '工业与专业', ja: '産業と専門', ko: '산업과 전문'
  },
  'CGS System': {
    en: 'CGS System', ar: 'نظام CGS', de: 'CGS-System',
    es: 'Sistema CGS', fr: 'Système CGS', it: 'Sistema CGS',
    pt: 'Sistema CGS', ru: 'Система СГС', zh: 'CGS制', ja: 'CGS単位系', ko: 'CGS 단위계'
  },
  'Archaic & Regional': {
    en: 'Archaic & Regional', ar: 'القديمة والإقليمية', de: 'Archaisch & Regional',
    es: 'Arcaico y Regional', fr: 'Archaïque et Régional', it: 'Arcaico e Regionale',
    pt: 'Arcaico e Regional', ru: 'Архаичные и Региональные', zh: '古代与地区', ja: '古代と地域', ko: '고대와 지역'
  },
  'Length': { 
    en: 'Length', ar: 'الطول', de: 'Länge',
    es: 'Longitud', fr: 'Longueur', it: 'Lunghezza',
    pt: 'Comprimento', ru: 'Длина', zh: '长度', ja: '長さ', ko: '길이'
  },
  'Mass': { 
    en: 'Mass', ar: 'الكتلة', de: 'Masse',
    es: 'Masa', fr: 'Masse', it: 'Massa',
    pt: 'Massa', ru: 'Масса', zh: '质量', ja: '質量', ko: '질량'
  },
  'Time': { 
    en: 'Time', ar: 'الوقت', de: 'Zeit',
    es: 'Tiempo', fr: 'Temps', it: 'Tempo',
    pt: 'Tempo', ru: 'Время', zh: '时间', ja: '時間', ko: '시간'
  },
  'Electric Current': {
    en: 'Electric Current', ar: 'التيار الكهربائي', de: 'Elektrischer Strom',
    es: 'Corriente Eléctrica', fr: 'Courant Électrique', it: 'Corrente Elettrica',
    pt: 'Corrente Elétrica', ru: 'Электрический Ток', zh: '电流', ja: '電流', ko: '전류'
  },
  'Temperature': { 
    en: 'Temperature', ar: 'درجة الحرارة', de: 'Temperatur',
    es: 'Temperatura', fr: 'Température', it: 'Temperatura',
    pt: 'Temperatura', ru: 'Температура', zh: '温度', ja: '温度', ko: '온도'
  },
  'Amount of Substance': {
    en: 'Amount of Substance', ar: 'كمية المادة', de: 'Stoffmenge',
    es: 'Cantidad de Sustancia', fr: 'Quantité de Matière', it: 'Quantità di Sostanza',
    pt: 'Quantidade de Substância', ru: 'Количество Вещества', zh: '物质的量', ja: '物質量', ko: '물질량'
  },
  'Luminous Intensity': {
    en: 'Luminous Intensity', ar: 'شدة الإضاءة', de: 'Lichtstärke',
    es: 'Intensidad Luminosa', fr: 'Intensité Lumineuse', it: 'Intensità Luminosa',
    pt: 'Intensidade Luminosa', ru: 'Сила Света', zh: '发光强度', ja: '光度', ko: '광도'
  },
  'Area': {
    en: 'Area', ar: 'المساحة', de: 'Fläche',
    es: 'Área', fr: 'Surface', it: 'Area',
    pt: 'Área', ru: 'Площадь', zh: '面积', ja: '面積', ko: '면적'
  },
  'Volume': {
    en: 'Volume', ar: 'الحجم', de: 'Volumen',
    es: 'Volumen', fr: 'Volume', it: 'Volume',
    pt: 'Volume', ru: 'Объём', zh: '体积', ja: '体積', ko: '부피'
  },
  'Speed': {
    en: 'Speed', ar: 'السرعة', de: 'Geschwindigkeit',
    es: 'Velocidad', fr: 'Vitesse', it: 'Velocità',
    pt: 'Velocidade', ru: 'Скорость', zh: '速度', ja: '速度', ko: '속도'
  },
  'Acceleration': {
    en: 'Acceleration', ar: 'التسارع', de: 'Beschleunigung',
    es: 'Aceleración', fr: 'Accélération', it: 'Accelerazione',
    pt: 'Aceleração', ru: 'Ускорение', zh: '加速度', ja: '加速度', ko: '가속도'
  },
  'Force': {
    en: 'Force', ar: 'القوة', de: 'Kraft',
    es: 'Fuerza', fr: 'Force', it: 'Forza',
    pt: 'Força', ru: 'Сила', zh: '力', ja: '力', ko: '힘'
  },
  'Energy': { 
    en: 'Energy', ar: 'الطاقة', de: 'Energie',
    es: 'Energía', fr: 'Énergie', it: 'Energia',
    pt: 'Energia', ru: 'Энергия', zh: '能量', ja: 'エネルギー', ko: '에너지'
  },
  'Pressure': { 
    en: 'Pressure', ar: 'الضغط', de: 'Druck',
    es: 'Presión', fr: 'Pression', it: 'Pressione',
    pt: 'Pressão', ru: 'Давление', zh: '压力', ja: '圧力', ko: '압력'
  },
  'Power': { 
    en: 'Power', ar: 'القدرة', de: 'Leistung',
    es: 'Potencia', fr: 'Puissance', it: 'Potenza',
    pt: 'Potência', ru: 'Мощность', zh: '功率', ja: '仕事率', ko: '일률'
  },
  'Frequency': {
    en: 'Frequency', ar: 'التردد', de: 'Frequenz',
    es: 'Frecuencia', fr: 'Fréquence', it: 'Frequenza',
    pt: 'Frequência', ru: 'Частота', zh: '频率', ja: '周波数', ko: '주파수'
  },
  'Electric Charge': {
    en: 'Electric Charge', ar: 'الشحنة الكهربائية', de: 'Elektrische Ladung',
    es: 'Carga Eléctrica', fr: 'Charge Électrique', it: 'Carica Elettrica',
    pt: 'Carga Elétrica', ru: 'Электрический Заряд', zh: '电荷', ja: '電荷', ko: '전하'
  },
  'Electric Potential': {
    en: 'Electric Potential', ar: 'الجهد الكهربائي', de: 'Elektrisches Potential',
    es: 'Potencial Eléctrico', fr: 'Potentiel Électrique', it: 'Potenziale Elettrico',
    pt: 'Potencial Elétrico', ru: 'Электрический Потенциал', zh: '电势', ja: '電位', ko: '전위'
  },
  'Capacitance': {
    en: 'Capacitance', ar: 'السعة الكهربائية', de: 'Kapazität',
    es: 'Capacitancia', fr: 'Capacité', it: 'Capacità',
    pt: 'Capacitância', ru: 'Ёмкость', zh: '电容', ja: '静電容量', ko: '전기용량'
  },
  'Resistance': {
    en: 'Resistance', ar: 'المقاومة', de: 'Widerstand',
    es: 'Resistencia', fr: 'Résistance', it: 'Resistenza',
    pt: 'Resistência', ru: 'Сопротивление', zh: '电阻', ja: '電気抵抗', ko: '저항'
  },
  'Conductance': {
    en: 'Conductance', ar: 'التوصيل', de: 'Leitwert',
    es: 'Conductancia', fr: 'Conductance', it: 'Conduttanza',
    pt: 'Condutância', ru: 'Проводимость', zh: '电导', ja: 'コンダクタンス', ko: '컨덕턴스'
  },
  'Inductance': {
    en: 'Inductance', ar: 'الحث', de: 'Induktivität',
    es: 'Inductancia', fr: 'Inductance', it: 'Induttanza',
    pt: 'Indutância', ru: 'Индуктивность', zh: '电感', ja: 'インダクタンス', ko: '인덕턴스'
  },
  'Magnetic Flux': {
    en: 'Magnetic Flux', ar: 'التدفق المغناطيسي', de: 'Magnetischer Fluss',
    es: 'Flujo Magnético', fr: 'Flux Magnétique', it: 'Flusso Magnetico',
    pt: 'Fluxo Magnético', ru: 'Магнитный Поток', zh: '磁通量', ja: '磁束', ko: '자속'
  },
  'Magnetic Density': {
    en: 'Magnetic Density', ar: 'الكثافة المغناطيسية', de: 'Magnetische Flussdichte',
    es: 'Densidad Magnética', fr: 'Densité Magnétique', it: 'Densità Magnetica',
    pt: 'Densidade Magnética', ru: 'Магнитная Индукция', zh: '磁感应强度', ja: '磁束密度', ko: '자속밀도'
  },
  'Radioactivity': {
    en: 'Radioactivity', ar: 'النشاط الإشعاعي', de: 'Radioaktivität',
    es: 'Radiactividad', fr: 'Radioactivité', it: 'Radioattività',
    pt: 'Radioatividade', ru: 'Радиоактивность', zh: '放射性', ja: '放射能', ko: '방사능'
  },
  'Radiation Dose': {
    en: 'Radiation Dose', ar: 'جرعة الإشعاع', de: 'Strahlendosis',
    es: 'Dosis de Radiación', fr: 'Dose de Rayonnement', it: 'Dose di Radiazione',
    pt: 'Dose de Radiação', ru: 'Доза Излучения', zh: '辐射剂量', ja: '放射線量', ko: '방사선량'
  },
  'Equivalent Dose': {
    en: 'Equivalent Dose', ar: 'الجرعة المكافئة', de: 'Äquivalentdosis',
    es: 'Dosis Equivalente', fr: 'Dose Équivalente', it: 'Dose Equivalente',
    pt: 'Dose Equivalente', ru: 'Эквивалентная Доза', zh: '等效剂量', ja: '等価線量', ko: '등가선량'
  },
  'Photon/Light': {
    en: 'Photon/Light', ar: 'الفوتون/الضوء', de: 'Photon/Licht',
    es: 'Fotón/Luz', fr: 'Photon/Lumière', it: 'Fotone/Luce',
    pt: 'Fóton/Luz', ru: 'Фотон/Свет', zh: '光子/光', ja: '光子/光', ko: '광자/빛'
  },
  'Radioactive Decay': {
    en: 'Radioactive Decay', ar: 'الاضمحلال الإشعاعي', de: 'Radioaktiver Zerfall',
    es: 'Desintegración Radiactiva', fr: 'Désintégration Radioactive', it: 'Decadimento Radioattivo',
    pt: 'Decaimento Radioativo', ru: 'Радиоактивный Распад', zh: '放射性衰变', ja: '放射性崩壊', ko: '방사성 붕괴'
  },
  'Cross-Section': {
    en: 'Cross-Section', ar: 'المقطع العرضي', de: 'Wirkungsquerschnitt',
    es: 'Sección Eficaz', fr: 'Section Efficace', it: 'Sezione d\'Urto',
    pt: 'Secção Transversal', ru: 'Сечение', zh: '截面', ja: '断面積', ko: '단면적'
  },
  'Catalytic Activity': {
    en: 'Catalytic Activity', ar: 'النشاط التحفيزي', de: 'Katalytische Aktivität',
    es: 'Actividad Catalítica', fr: 'Activité Catalytique', it: 'Attività Catalitica',
    pt: 'Atividade Catalítica', ru: 'Каталитическая Активность', zh: '催化活性', ja: '触媒活性', ko: '촉매활성'
  },
  'Plane Angle': {
    en: 'Plane Angle', ar: 'الزاوية المستوية', de: 'Ebener Winkel',
    es: 'Ángulo Plano', fr: 'Angle Plan', it: 'Angolo Piano',
    pt: 'Ângulo Plano', ru: 'Плоский Угол', zh: '平面角', ja: '平面角', ko: '평면각'
  },
  'Solid Angle': {
    en: 'Solid Angle', ar: 'الزاوية الصلبة', de: 'Raumwinkel',
    es: 'Ángulo Sólido', fr: 'Angle Solide', it: 'Angolo Solido',
    pt: 'Ângulo Sólido', ru: 'Телесный Угол', zh: '立体角', ja: '立体角', ko: '입체각'
  },
  'Angular Velocity': {
    en: 'Angular Velocity', ar: 'السرعة الزاوية', de: 'Winkelgeschwindigkeit',
    es: 'Velocidad Angular', fr: 'Vitesse Angulaire', it: 'Velocità Angolare',
    pt: 'Velocidade Angular', ru: 'Угловая Скорость', zh: '角速度', ja: '角速度', ko: '각속도'
  },
  'Momentum': {
    en: 'Momentum', ar: 'الزخم', de: 'Impuls',
    es: 'Momento', fr: 'Quantité de Mouvement', it: 'Quantità di Moto',
    pt: 'Momento', ru: 'Импульс', zh: '动量', ja: '運動量', ko: '운동량'
  },
  'Angular Momentum': {
    en: 'Angular Momentum', ar: 'الزخم الزاوي', de: 'Drehimpuls',
    es: 'Momento Angular', fr: 'Moment Cinétique', it: 'Momento Angolare',
    pt: 'Momento Angular', ru: 'Угловой Момент', zh: '角动量', ja: '角運動量', ko: '각운동량'
  },
  'Luminous Flux': {
    en: 'Luminous Flux', ar: 'التدفق الضوئي', de: 'Lichtstrom',
    es: 'Flujo Luminoso', fr: 'Flux Lumineux', it: 'Flusso Luminoso',
    pt: 'Fluxo Luminoso', ru: 'Световой Поток', zh: '光通量', ja: '光束', ko: '광속'
  },
  'Illuminance': {
    en: 'Illuminance', ar: 'الإضاءة', de: 'Beleuchtungsstärke',
    es: 'Iluminancia', fr: 'Éclairement', it: 'Illuminamento',
    pt: 'Iluminância', ru: 'Освещённость', zh: '照度', ja: '照度', ko: '조도'
  },
  'Luminous Exitance': {
    en: 'Luminous Exitance', ar: 'الخروج الضوئي', de: 'Spezifische Lichtausstrahlung',
    es: 'Exitancia Luminosa', fr: 'Exitance Lumineuse', it: 'Emittanza Luminosa',
    pt: 'Exitância Luminosa', ru: 'Светимость', zh: '光出射度', ja: '光発散度', ko: '광발산도'
  },
  'Luminance': {
    en: 'Luminance', ar: 'السطوع', de: 'Leuchtdichte',
    es: 'Luminancia', fr: 'Luminance', it: 'Luminanza',
    pt: 'Luminância', ru: 'Яркость', zh: '亮度', ja: '輝度', ko: '휘도'
  },
  'Torque': {
    en: 'Torque', ar: 'عزم الدوران', de: 'Drehmoment',
    es: 'Torque', fr: 'Couple', it: 'Coppia',
    pt: 'Torque', ru: 'Крутящий Момент', zh: '扭矩', ja: 'トルク', ko: '토크'
  },
  'Density': {
    en: 'Density', ar: 'الكثافة', de: 'Dichte',
    es: 'Densidad', fr: 'Densité', it: 'Densità',
    pt: 'Densidade', ru: 'Плотность', zh: '密度', ja: '密度', ko: '밀도'
  },
  'Flow Rate': {
    en: 'Flow Rate', ar: 'معدل التدفق', de: 'Durchflussrate',
    es: 'Caudal', fr: 'Débit', it: 'Portata',
    pt: 'Taxa de Fluxo', ru: 'Расход', zh: '流量', ja: '流量', ko: '유량'
  },
  'Dynamic Viscosity': {
    en: 'Dynamic Viscosity', ar: 'اللزوجة الديناميكية', de: 'Dynamische Viskosität',
    es: 'Viscosidad Dinámica', fr: 'Viscosité Dynamique', it: 'Viscosità Dinamica',
    pt: 'Viscosidade Dinâmica', ru: 'Динамическая Вязкость', zh: '动力粘度', ja: '動粘度', ko: '동점도'
  },
  'Kinematic Viscosity': {
    en: 'Kinematic Viscosity', ar: 'اللزوجة الحركية', de: 'Kinematische Viskosität',
    es: 'Viscosidad Cinemática', fr: 'Viscosité Cinématique', it: 'Viscosità Cinematica',
    pt: 'Viscosidade Cinemática', ru: 'Кинематическая Вязкость', zh: '运动粘度', ja: '動粘性係数', ko: '운동점도'
  },
  'Surface Tension': {
    en: 'Surface Tension', ar: 'التوتر السطحي', de: 'Oberflächenspannung',
    es: 'Tensión Superficial', fr: 'Tension Superficielle', it: 'Tensione Superficiale',
    pt: 'Tensão Superficial', ru: 'Поверхностное Натяжение', zh: '表面张力', ja: '表面張力', ko: '표면장력'
  },
  'Thermal Conductivity': {
    en: 'Thermal Conductivity', ar: 'التوصيل الحراري', de: 'Wärmeleitfähigkeit',
    es: 'Conductividad Térmica', fr: 'Conductivité Thermique', it: 'Conduttività Termica',
    pt: 'Condutividade Térmica', ru: 'Теплопроводность', zh: '热导率', ja: '熱伝導率', ko: '열전도율'
  },
  'Specific Heat': {
    en: 'Specific Heat', ar: 'الحرارة النوعية', de: 'Spezifische Wärme',
    es: 'Calor Específico', fr: 'Chaleur Spécifique', it: 'Calore Specifico',
    pt: 'Calor Específico', ru: 'Удельная Теплоёмкость', zh: '比热容', ja: '比熱', ko: '비열'
  },
  'Entropy': {
    en: 'Entropy', ar: 'الإنتروبيا', de: 'Entropie',
    es: 'Entropía', fr: 'Entropie', it: 'Entropia',
    pt: 'Entropia', ru: 'Энтропия', zh: '熵', ja: 'エントロピー', ko: '엔트로피'
  },
  'Concentration': {
    en: 'Concentration', ar: 'التركيز', de: 'Konzentration',
    es: 'Concentración', fr: 'Concentration', it: 'Concentrazione',
    pt: 'Concentração', ru: 'Концентрация', zh: '浓度', ja: '濃度', ko: '농도'
  },
  'Data': {
    en: 'Data', ar: 'البيانات', de: 'Daten',
    es: 'Datos', fr: 'Données', it: 'Dati',
    pt: 'Dados', ru: 'Данные', zh: '数据', ja: 'データ', ko: '데이터'
  },
  'Rack Geometry': {
    en: 'Rack Geometry', ar: 'هندسة الرف', de: 'Rack-Geometrie',
    es: 'Geometría de Rack', fr: 'Géométrie de Rack', it: 'Geometria Rack',
    pt: 'Geometria de Rack', ru: 'Геометрия Стойки', zh: '机架几何', ja: 'ラック寸法', ko: '랙 지오메트리'
  },
  'Shipping': {
    en: 'Shipping', ar: 'الشحن', de: 'Versand',
    es: 'Envío', fr: 'Expédition', it: 'Spedizione',
    pt: 'Envio', ru: 'Доставка', zh: '运输', ja: '配送', ko: '배송'
  },
  'Math': {
    en: 'Math', ar: 'الرياضيات', de: 'Mathematik',
    es: 'Matemáticas', fr: 'Mathématiques', it: 'Matematica',
    pt: 'Matemática', ru: 'Математика', zh: '数学', ja: '数学', ko: '수학'
  },
  'Beer & Wine Volume': {
    en: 'Beer & Wine Volume', ar: 'حجم البيرة والنبيذ', de: 'Bier & Wein Volumen',
    es: 'Volumen de Cerveza y Vino', fr: 'Volume de Bière et Vin', it: 'Volume Birra e Vino',
    pt: 'Volume de Cerveja e Vinho', ru: 'Объём Пива и Вина', zh: '啤酒和葡萄酒容量', ja: 'ビール・ワイン容量', ko: '맥주와 와인 용량'
  },
  'Fuel Energy': {
    en: 'Fuel Energy', ar: 'طاقة الوقود', de: 'Brennstoffenergie',
    es: 'Energía de Combustible', fr: 'Énergie de Carburant', it: 'Energia Combustibile',
    pt: 'Energia de Combustível', ru: 'Энергия Топлива', zh: '燃料能量', ja: '燃料エネルギー', ko: '연료 에너지'
  },
  'Fuel Economy': {
    en: 'Fuel Economy', ar: 'استهلاك الوقود', de: 'Kraftstoffverbrauch',
    es: 'Economía de Combustible', fr: 'Économie de Carburant', it: 'Economia di Carburante',
    pt: 'Economia de Combustível', ru: 'Расход Топлива', zh: '燃油经济性', ja: '燃費', ko: '연비'
  },
  'Typography': {
    en: 'Typography', ar: 'الطباعة', de: 'Typografie',
    es: 'Tipografía', fr: 'Typographie', it: 'Tipografia',
    pt: 'Tipografia', ru: 'Типографика', zh: '字体排印', ja: 'タイポグラフィ', ko: '타이포그래피'
  },
  'Cooking Measures': {
    en: 'Cooking Measures', ar: 'مقاييس الطهي', de: 'Kochmaße',
    es: 'Medidas de Cocina', fr: 'Mesures de Cuisine', it: 'Misure di Cucina',
    pt: 'Medidas de Cozinha', ru: 'Кулинарные Меры', zh: '烹饪量度', ja: '料理用計量', ko: '요리 계량'
  },
  'Archaic Length': {
    en: 'Archaic Length', ar: 'الأطوال القديمة', de: 'Archaische Längen',
    es: 'Longitud Arcaica', fr: 'Longueur Archaïque', it: 'Lunghezza Arcaica',
    pt: 'Comprimento Arcaico', ru: 'Архаичные Длины', zh: '古代长度', ja: '古代の長さ', ko: '고대 길이'
  },
  'Archaic Mass': {
    en: 'Archaic Mass', ar: 'الأوزان القديمة', de: 'Archaische Masse',
    es: 'Masa Arcaica', fr: 'Masse Archaïque', it: 'Massa Arcaica',
    pt: 'Massa Arcaica', ru: 'Архаичные Массы', zh: '古代质量', ja: '古代の質量', ko: '고대 질량'
  },
  'Archaic Volume': {
    en: 'Archaic Volume', ar: 'الأحجام القديمة', de: 'Archaisches Volumen',
    es: 'Volumen Arcaico', fr: 'Volume Archaïque', it: 'Volume Arcaico',
    pt: 'Volume Arcaico', ru: 'Архаичные Объёмы', zh: '古代容量', ja: '古代の容積', ko: '고대 부피'
  },
  'Archaic Area': {
    en: 'Archaic Area', ar: 'المساحات القديمة', de: 'Archaische Flächen',
    es: 'Área Arcaica', fr: 'Surface Archaïque', it: 'Area Arcaica',
    pt: 'Área Arcaica', ru: 'Архаичные Площади', zh: '古代面积', ja: '古代の面積', ko: '고대 면적'
  },
  'Archaic Energy': {
    en: 'Archaic Energy', ar: 'الطاقة القديمة', de: 'Archaische Energie',
    es: 'Energía Arcaica', fr: 'Énergie Archaïque', it: 'Energia Arcaica',
    pt: 'Energia Arcaica', ru: 'Архаичная Энергия', zh: '古代能量', ja: '古代のエネルギー', ko: '고대 에너지'
  },
  'Archaic Power': {
    en: 'Archaic Power', ar: 'القدرة القديمة', de: 'Archaische Leistung',
    es: 'Potencia Arcaica', fr: 'Puissance Archaïque', it: 'Potenza Arcaica',
    pt: 'Potência Arcaica', ru: 'Архаичная Мощность', zh: '古代功率', ja: '古代の仕事率', ko: '고대 일률'
  },
  'Converter': {
    en: 'Converter', ar: 'محول', de: 'Konverter',
    es: 'Convertidor', fr: 'Convertisseur', it: 'Convertitore',
    pt: 'Conversor', ru: 'Конвертер', zh: '转换器', ja: 'コンバーター', ko: '변환기'
  },
  'Custom': {
    en: 'Custom', ar: 'مخصص', de: 'Benutzerdefiniert',
    es: 'Personalizado', fr: 'Personnalisé', it: 'Personalizzato',
    pt: 'Personalizado', ru: 'Пользовательский', zh: '自定义', ja: 'カスタム', ko: '사용자 정의'
  },
  'Custom Entry': {
    en: 'Custom Entry', ar: 'إدخال مخصص', de: 'Benutzerdefinierte Eingabe',
    es: 'Entrada Personalizada', fr: 'Entrée Personnalisée', it: 'Inserimento Personalizzato',
    pt: 'Entrada Personalizada', ru: 'Пользовательский Ввод', zh: '自定义输入', ja: 'カスタム入力', ko: '사용자 정의 입력'
  },
  'Build dimensional units from SI base units': {
    en: 'Build dimensional units from SI base units',
    ar: 'بناء الوحدات الأبعادية من الوحدات الأساسية SI',
    de: 'Dimensionsbehaftete Einheiten aus SI-Basiseinheiten aufbauen',
    es: 'Construir unidades dimensionales a partir de unidades base SI',
    fr: 'Construire des unités dimensionnelles à partir des unités de base SI',
    it: 'Costruire unità dimensionali dalle unità base SI',
    pt: 'Construir unidades dimensionais a partir das unidades base SI',
    ru: 'Строить размерные единицы из базовых единиц СИ',
    zh: '从SI基本单位构建量纲单位',
    ja: 'SI基本単位から次元単位を構築',
    ko: 'SI 기본 단위에서 차원 단위 구성'
  },
  'Enter value or \'value unit\'': {
    en: "Enter value or 'value unit'",
    ar: "أدخل القيمة أو 'قيمة وحدة'",
    de: "Wert oder 'Wert Einheit' eingeben",
    es: "Introduzca el valor o 'valor unidad'",
    fr: "Entrez la valeur ou 'valeur unité'",
    it: "Inserire il valore o 'valore unità'",
    pt: "Insira o valor ou 'valor unidade'",
    ru: "Введите значение или 'значение единица'",
    zh: "输入数值或'数值 单位'",
    ja: "値または'値 単位'を入力",
    ko: "값 또는 '값 단위' 입력"
  },
  'Select SI representation': {
    en: 'Select SI representation',
    ar: 'اختر تمثيل SI',
    de: 'SI-Darstellung wählen',
    es: 'Seleccionar representación SI',
    fr: 'Sélectionner la représentation SI',
    it: 'Seleziona la rappresentazione SI',
    pt: 'Selecionar representação SI',
    ru: 'Выбрать представление СИ',
    zh: '选择SI表示',
    ja: 'SI表現を選択',
    ko: 'SI 표현 선택'
  },
  'num-format-english': {
    en: 'English', ar: 'إنجليزي', de: 'Englisch',
    es: 'Inglés', fr: 'Anglais', it: 'Inglese',
    pt: 'Inglês', ru: 'Английский', zh: '英式', ja: '英語式', ko: '영어식'
  },
  'num-format-world': {
    en: 'World', ar: 'عالمي', de: 'International',
    es: 'Mundial', fr: 'Mondial', it: 'Mondiale',
    pt: 'Mundial', ru: 'Международный', zh: '国际', ja: '国際', ko: '국제'
  },
  'num-format-period': {
    en: 'Period', ar: 'نقطة', de: 'Punkt',
    es: 'Punto', fr: 'Point', it: 'Punto',
    pt: 'Ponto', ru: 'Точка', zh: '点号', ja: 'ピリオド', ko: '마침표'
  },
  'num-format-comma': {
    en: 'Comma', ar: 'فاصلة', de: 'Komma',
    es: 'Coma', fr: 'Virgule', it: 'Virgola',
    pt: 'Vírgula', ru: 'Запятая', zh: '逗号', ja: 'コンマ', ko: '쉼표'
  },
  'num-format-east-asian': {
    en: 'East Asian', ar: 'شرق آسيا', de: 'Ostasiatisch',
    es: 'Asiático Oriental', fr: 'Asie de l\'Est', it: 'Asia Orientale',
    pt: 'Ásia Oriental', ru: 'Восточноазиатский', zh: '东亚', ja: '東アジア', ko: '동아시아'
  },
  'num-format-south-asian': {
    en: 'South Asian (Indian)', ar: 'جنوب آسيا (هندي)', de: 'Südasiatisch (Indisch)',
    es: 'Asiático Meridional (Indio)', fr: 'Asie du Sud (Indien)', it: 'Asia Meridionale (Indiano)',
    pt: 'Sul-Asiático (Indiano)', ru: 'Южноазиатский (Индийский)', zh: '南亚（印度）', ja: '南アジア（インド）', ko: '남아시아 (인도)'
  },
  'num-format-swiss': {
    en: 'Swiss', ar: 'سويسري', de: 'Schweizer',
    es: 'Suizo', fr: 'Suisse', it: 'Svizzero',
    pt: 'Suíço', ru: 'Швейцарский', zh: '瑞士', ja: 'スイス', ko: '스위스'
  },
  'rpn-tooltip-enter': {
    en: 'Push x onto stack (Enter)',
    ar: 'ادفع x إلى المكدس (إدخال)',
    de: 'x auf den Stapel legen (Enter)',
    es: 'Empujar x a la pila (Enter)',
    fr: 'Pousser x dans la pile (Entrée)',
    it: 'Spingere x nello stack (Invio)',
    pt: 'Empurrar x para a pilha (Enter)',
    ru: 'Поместить x в стек (Ввод)',
    zh: '将x压入堆栈（Enter）',
    ja: 'xをスタックにプッシュ（Enter）',
    ko: 'x를 스택에 넣기 (Enter)'
  },
  'rpn-tooltip-drop': {
    en: 'Remove top of stack (Drop)',
    ar: 'إزالة أعلى المكدس (حذف)',
    de: 'Oberstes Stack-Element entfernen (Drop)',
    es: 'Eliminar la cima de la pila (Drop)',
    fr: 'Supprimer le sommet de la pile (Drop)',
    it: 'Rimuovere la cima dello stack (Drop)',
    pt: 'Remover o topo da pilha (Drop)',
    ru: 'Удалить верхний элемент стека (Drop)',
    zh: '删除堆栈顶部（Drop）',
    ja: 'スタックの先頭を削除（Drop）',
    ko: '스택의 맨 위 제거 (Drop)'
  },
  'rpn-tooltip-swap': {
    en: 'Swap x and y registers (x⇆y)',
    ar: 'تبادل سجلي x و y',
    de: 'x- und y-Register tauschen (x⇆y)',
    es: 'Intercambiar registros x e y (x⇆y)',
    fr: 'Échanger les registres x et y (x⇆y)',
    it: 'Scambiare i registri x e y (x⇆y)',
    pt: 'Trocar registros x e y (x⇆y)',
    ru: 'Поменять местами регистры x и y',
    zh: '交换x和y寄存器（x⇆y）',
    ja: 'xレジスタとyレジスタを交換（x⇆y）',
    ko: 'x와 y 레지스터 교환 (x⇆y)'
  },
  'rpn-tooltip-lastx': {
    en: 'Recall last x value used (LASTx)',
    ar: 'استدعاء آخر قيمة x مستخدمة',
    de: 'Letzten x-Wert zurückrufen (LASTx)',
    es: 'Recuperar el último valor x usado (LASTx)',
    fr: 'Rappeler la dernière valeur x utilisée (LASTx)',
    it: 'Richiamare l\'ultimo valore x usato (LASTx)',
    pt: 'Recuperar o último valor x usado (LASTx)',
    ru: 'Вспомнить последнее значение x',
    zh: '调用最后使用的x值（LASTx）',
    ja: '最後に使用したx値を呼び出す（LASTx）',
    ko: '마지막 사용한 x 값 불러오기 (LASTx)'
  },
  'rpn-tooltip-pull': {
    en: 'Pull result from converter into stack (PULL)',
    ar: 'سحب نتيجة المحول إلى المكدس',
    de: 'Ergebnis vom Konverter in den Stapel ziehen (PULL)',
    es: 'Jalar el resultado del convertidor al stack (PULL)',
    fr: 'Tirer le résultat du convertisseur dans la pile (PULL)',
    it: 'Portare il risultato del convertitore nello stack (PULL)',
    pt: 'Puxar o resultado do conversor para a pilha (PULL)',
    ru: 'Перетащить результат из конвертера в стек',
    zh: '从转换器拉取结果到堆栈（PULL）',
    ja: 'コンバーターから結果をスタックに引き込む（PULL）',
    ko: '변환기 결과를 스택으로 가져오기 (PULL)'
  },
  'rpn-tooltip-undo': {
    en: 'Undo last stack operation',
    ar: 'تراجع عن آخر عملية في المكدس',
    de: 'Letzte Stapel-Operation rückgängig machen',
    es: 'Deshacer la última operación de pila',
    fr: 'Annuler la dernière opération de pile',
    it: 'Annullare l\'ultima operazione dello stack',
    pt: 'Desfazer a última operação da pilha',
    ru: 'Отменить последнюю операцию стека',
    zh: '撤销上一次堆栈操作',
    ja: '最後のスタック操作を元に戻す',
    ko: '마지막 스택 작업 취소'
  },
  'rpn-tooltip-shift': {
    en: 'Toggle shift for alternate key functions (SHIFT)',
    ar: 'تبديل shift للوظائف البديلة للمفاتيح',
    de: 'Shift für alternative Tastenfunktionen umschalten (SHIFT)',
    es: 'Alternar shift para funciones alternas de teclas (SHIFT)',
    fr: 'Basculer shift pour les fonctions alternatives des touches (SHIFT)',
    it: 'Attivare shift per funzioni alternative dei tasti (SHIFT)',
    pt: 'Alternar shift para funções alternativas das teclas (SHIFT)',
    ru: 'Переключить shift для альтернативных функций клавиш',
    zh: '切换Shift以使用备用键功能（SHIFT）',
    ja: '代替キー機能のためのShiftを切り替える（SHIFT）',
    ko: '대체 키 기능을 위한 Shift 전환 (SHIFT)'
  },
  'rpn-tooltip-abs': {
    en: 'Absolute value of x (ABS)',
    ar: 'القيمة المطلقة لـ x',
    de: 'Absolutwert von x (ABS)',
    es: 'Valor absoluto de x (ABS)',
    fr: 'Valeur absolue de x (ABS)',
    it: 'Valore assoluto di x (ABS)',
    pt: 'Valor absoluto de x (ABS)',
    ru: 'Абсолютное значение x (ABS)',
    zh: 'x的绝对值（ABS）',
    ja: 'xの絶対値（ABS）',
    ko: 'x의 절댓값 (ABS)'
  },
  'rpn-tooltip-negate': {
    en: 'Negate x, change sign (+/−)',
    ar: 'عكس إشارة x',
    de: 'x negieren, Vorzeichen wechseln (+/−)',
    es: 'Negar x, cambiar signo (+/−)',
    fr: 'Négation de x, changer le signe (+/−)',
    it: 'Negare x, cambiare segno (+/−)',
    pt: 'Negar x, trocar sinal (+/−)',
    ru: 'Изменить знак x (+/−)',
    zh: '对x取反，更改符号（+/−）',
    ja: 'xを否定する、符号を変える（+/−）',
    ko: 'x 부정, 부호 변경 (+/−)'
  },
  'rpn-tooltip-rnd': {
    en: 'Round x to current precision (rnd)',
    ar: 'تقريب x إلى الدقة الحالية',
    de: 'x auf aktuelle Genauigkeit runden (rnd)',
    es: 'Redondear x a la precisión actual (rnd)',
    fr: 'Arrondir x à la précision actuelle (rnd)',
    it: 'Arrotondare x alla precisione corrente (rnd)',
    pt: 'Arredondar x para a precisão atual (rnd)',
    ru: 'Округлить x до текущей точности (rnd)',
    zh: '将x舍入到当前精度（rnd）',
    ja: 'xを現在の精度に丸める（rnd）',
    ko: 'x를 현재 정밀도로 반올림 (rnd)'
  },
  'rpn-tooltip-trunc': {
    en: 'Truncate x to current precision (trunc)',
    ar: 'اقتطاع x إلى الدقة الحالية',
    de: 'x auf aktuelle Genauigkeit abschneiden (trunc)',
    es: 'Truncar x a la precisión actual (trunc)',
    fr: 'Tronquer x à la précision actuelle (trunc)',
    it: 'Troncare x alla precisione corrente (trunc)',
    pt: 'Truncar x para a precisão atual (trunc)',
    ru: 'Усечь x до текущей точности (trunc)',
    zh: '将x截断到当前精度（trunc）',
    ja: 'xを現在の精度に切り捨てる（trunc）',
    ko: 'x를 현재 정밀도로 절사 (trunc)'
  },
  '404 Page Not Found': {
    en: '404 Page Not Found',
    ar: '404 الصفحة غير موجودة',
    de: '404 Seite nicht gefunden',
    es: '404 Página no encontrada',
    fr: '404 Page non trouvée',
    it: '404 Pagina non trovata',
    pt: '404 Página não encontrada',
    ru: '404 Страница не найдена',
    zh: '404 页面未找到',
    ja: '404 ページが見つかりません',
    ko: '404 페이지를 찾을 수 없습니다'
  },
  '404-description': {
    en: 'Did you forget to add the page to the router?',
    ar: 'هل نسيت إضافة الصفحة إلى جهاز التوجيه؟',
    de: 'Haben Sie vergessen, die Seite zum Router hinzuzufügen?',
    es: '¿Olvidaste agregar la página al enrutador?',
    fr: 'Avez-vous oublié d\'ajouter la page au routeur?',
    it: 'Hai dimenticato di aggiungere la pagina al router?',
    pt: 'Esqueceu de adicionar a página ao roteador?',
    ru: 'Вы забыли добавить страницу в маршрутизатор?',
    zh: '您忘记将页面添加到路由器了吗？',
    ja: 'ページをルーターに追加し忘れましたか？',
    ko: '라우터에 페이지를 추가하는 것을 잊으셨나요?'
  },
  'Number formatting': {
    en: 'Number formatting',
    ar: 'تنسيق الأرقام',
    de: 'Zahlenformat',
    es: 'Formato de número',
    fr: 'Format des nombres',
    it: 'Formato numerico',
    pt: 'Formato de número',
    ru: 'Формат чисел',
    zh: '数字格式',
    ja: '数値フォーマット',
    ko: '숫자 형식'
  },
  // ── Help section paragraphs ──────────────────────────────────────────────
  // SOURCE OF TRUTH: The English strings below are the canonical source.
  // All other languages are machine-translated from English.
  // If a translation looks wrong, switch the UI to 'en' to read the original.
  'help-para-1': {
    en: "OmniUnit is a universal conversion tool with a unit-aware calculator. It supports lots of units — everything you want, and a bunch of stuff you've never heard of. It is SI-focused; all values are stored internally as SI base unit expressions. You can do a simple conversion or paste in a full expression: copy \"127.2342 J⋅s⁻¹\" from a paper and paste it into the calculator — it will work. Type \"7yd\" and it parses that too. Units are organized into SI areas to reduce confusion. Power has power-related units: Watts, BTU, etc. No scrolling through thousands of units to find the one you want. Archaic and local units are also supported, but separately. You want tatami to m²? It's got you covered.",
    ar: 'OmniUnit أداة تحويل شاملة مع حاسبة تدرك الوحدات. تدعم عدداً كبيراً من الوحدات — كل ما تحتاجه وأكثر مما سمعت به. تعمل بنظام SI، وتُخزَّن جميع القيم داخلياً كتعبيرات وحدة SI أساسية. يمكنك إجراء تحويل بسيط أو لصق تعبير كامل: انسخ «127.2342 J⋅s⁻¹» من ورقة بحثية وألصقه في الحاسبة وسيعمل. اكتب «7yd» وسيحلله أيضاً. الوحدات مرتبة حسب مجالات SI لتقليل الفوضى. وحدات الطاقة مجمعة معاً: واط، BTU، إلخ. بدون تمرير لا نهائي للعثور على ما تريد. الوحدات القديمة والإقليمية مدعومة أيضاً، ولكن بشكل منفصل. تريد تحويل تاتامي إلى م²؟ لديك ما تحتاجه.',
    de: 'OmniUnit ist ein universelles Konvertierungswerkzeug mit einem einheitenbewussten Taschenrechner. Es unterstützt eine riesige Auswahl an Einheiten – alles, was Sie benötigen, und einiges mehr. Der Fokus liegt auf SI; alle Werte werden intern als SI-Basiseinheitenausdrücke gespeichert. Sie können eine einfache Umrechnung durchführen oder einen vollständigen Ausdruck einfügen: Kopieren Sie „127.2342 J⋅s⁻¹" aus einem Fachaufsatz und fügen Sie ihn direkt in den Rechner ein – es funktioniert. Tippen Sie „7yd" ein und es wird ebenfalls geparst. Einheiten sind nach SI-Bereichen geordnet, um Verwirrung zu vermeiden. Leistungseinheiten sind zusammengefasst: Watt, BTU usw. Kein endloses Scrollen nach der gewünschten Einheit. Veraltete und regionale Einheiten werden ebenfalls unterstützt, aber separat. Tatami in m²? Kein Problem.',
    es: 'OmniUnit es una herramienta de conversión universal con una calculadora con reconocimiento de unidades. Admite una gran variedad de unidades: todo lo que necesita y más. Está centrada en el SI; todos los valores se almacenan internamente como expresiones de unidades base SI. Puede hacer una conversión simple o pegar una expresión completa: copie «127.2342 J⋅s⁻¹» de un artículo y péguela en la calculadora — funcionará. Escriba «7yd» y también lo interpretará. Las unidades están organizadas en áreas SI para reducir la confusión. Las unidades de potencia están agrupadas: vatios, BTU, etc. Sin desplazamiento interminable. Las unidades arcaicas y regionales también son compatibles, pero de forma separada. ¿Tatami a m²? Lo tiene cubierto.',
    fr: 'OmniUnit est un outil de conversion universel doté d\'une calculatrice avec gestion des unités. Il prend en charge un grand nombre d\'unités — tout ce dont vous avez besoin, et même plus. Centré sur le SI, toutes les valeurs sont stockées en interne sous forme d\'expressions d\'unités de base SI. Vous pouvez effectuer une conversion simple ou coller une expression complète : copiez « 127.2342 J⋅s⁻¹ » d\'un article et collez-le dans la calculatrice — ça fonctionne. Tapez « 7yd » et il l\'analysera aussi. Les unités sont organisées en domaines SI pour réduire la confusion. Les unités de puissance sont regroupées : watts, BTU, etc. Plus besoin de faire défiler des milliers d\'unités. Les unités archaïques et régionales sont également prises en charge, mais séparément. Tatami en m² ? C\'est possible.',
    it: 'OmniUnit è uno strumento di conversione universale con una calcolatrice consapevole delle unità. Supporta un\'enorme varietà di unità — tutto ciò di cui hai bisogno e anche di più. È incentrato sul SI; tutti i valori sono memorizzati internamente come espressioni di unità base SI. Puoi effettuare una conversione semplice o incollare un\'espressione completa: copia «127.2342 J⋅s⁻¹» da un articolo e incollala nella calcolatrice — funzionerà. Digita «7yd» e lo analizzerà anche quello. Le unità sono organizzate in aree SI per ridurre la confusione. Le unità di potenza sono raggruppate: watt, BTU, ecc. Niente scorrimento infinito. Le unità arcaiche e regionali sono supportate anch\'esse, ma separatamente. Tatami in m²? Hai quello che ti serve.',
    pt: 'OmniUnit é uma ferramenta de conversão universal com uma calculadora com reconhecimento de unidades. Suporta uma enorme variedade de unidades — tudo o que você precisa e mais. É focada no SI; todos os valores são armazenados internamente como expressões de unidades base SI. Pode fazer uma conversão simples ou colar uma expressão completa: copie «127.2342 J⋅s⁻¹» de um artigo e cole na calculadora — vai funcionar. Digite «7yd» e também será analisado. As unidades estão organizadas em áreas SI para reduzir a confusão. As unidades de potência são agrupadas: watts, BTU, etc. Sem rolagem infinita. Unidades arcaicas e regionais também são suportadas, mas separadamente. Tatami para m²? Está coberto.',
    ru: 'OmniUnit — универсальный инструмент конвертации с калькулятором, поддерживающим единицы измерения. Охватывает огромное количество единиц — всё, что нужно, и многое другое. Сфокусирован на СИ; все значения хранятся внутри как выражения базовых единиц СИ. Можно выполнить простое преобразование или вставить полное выражение: скопируйте «127.2342 J⋅s⁻¹» из статьи и вставьте в калькулятор — всё сработает. Введите «7yd» — и это тоже будет распознано. Единицы сгруппированы по областям СИ. Единицы мощности объединены вместе: ватты, BTU и т. д. Никакой бесконечной прокрутки. Устаревшие и региональные единицы также поддерживаются, но в отдельных группах. Хотите перевести татами в м²? Всё предусмотрено.',
    zh: 'OmniUnit 是一款通用单位转换工具，内置支持单位的计算器。支持大量单位——包括您需要的一切以及更多。以 SI 为核心，所有数值在内部均以 SI 基本单位表达式存储。可进行简单换算，或直接粘贴完整表达式：从论文中复制「127.2342 J⋅s⁻¹」并粘贴到计算器中即可使用。输入「7yd」同样可以解析。单位按 SI 领域分组以减少混乱。功率单位集中在一起：瓦特、BTU 等，无需无休止地滚动。古老和地区性单位也受支持，但单独列出。想把榻榻米转换为平方米？完全没问题。',
    ja: 'OmniUnit は、単位対応の計算機を備えた汎用変換ツールです。膨大な種類の単位に対応しており、必要なものはすべて網羅しています。SI を基軸とし、すべての値は内部で SI 基本単位式として保持されます。簡単な変換も、完全な式の貼り付けも可能です。論文から「127.2342 J⋅s⁻¹」をコピーして計算機に貼り付ければそのまま動作します。「7yd」と入力しても同様に解析されます。単位は SI 分野ごとに整理されています。電力単位はまとめて表示：W、BTU など。膨大なリストをスクロールする必要はありません。古い単位や地域固有の単位も別途サポートされています。畳を m² に換算したい？もちろん対応しています。',
    ko: 'OmniUnit은 단위 인식 계산기를 갖춘 범용 단위 변환 도구입니다. 방대한 수의 단위를 지원하며, 필요한 모든 것을 포함합니다. SI 중심으로 설계되어 모든 값이 내부적으로 SI 기본 단위 표현식으로 저장됩니다. 간단한 변환은 물론 전체 표현식을 붙여넣을 수도 있습니다. 논문에서 「127.2342 J⋅s⁻¹」를 복사하여 계산기에 붙여넣으면 바로 작동합니다. 「7yd」를 입력해도 마찬가지로 파싱됩니다. 단위는 SI 영역별로 정리되어 혼란을 줄입니다. 전력 단위는 한 곳에 모아 놓았습니다: 와트, BTU 등. 끝없이 스크롤할 필요가 없습니다. 고대 및 지역 단위도 별도로 지원됩니다. 다다미를 m²로 변환하고 싶으신가요? 물론 가능합니다.'
  },
  'help-para-2': {
    en: "It's localized for about a dozen languages and supports the most common number formats worldwide. You don't need to understand English to use it. It defaults to English number formats and the en locale. So you need to get at least that far into the app; otherwise, it's not readable.",
    ar: 'التطبيق مترجم لنحو اثنتي عشرة لغة ويدعم تنسيقات الأرقام الأكثر شيوعاً في العالم. لا تحتاج إلى فهم الإنجليزية لاستخدامه. يعمل افتراضياً بتنسيق الأرقام الإنجليزي وبلغة en. لذا، تحتاج إلى الوصول إلى هذه النقطة في التطبيق أولاً؛ وإلا فلن تتمكن من قراءته.',
    de: 'Die App ist für rund ein Dutzend Sprachen lokalisiert und unterstützt die gängigsten Zahlenformate weltweit. Sie müssen kein Englisch verstehen, um sie zu nutzen. Standardmäßig sind das englische Zahlenformat und das Gebietsschema „en" eingestellt. Sie müssen also zumindest so weit in die App einsteigen; andernfalls ist sie nicht lesbar.',
    es: 'Está localizada en aproximadamente una docena de idiomas y admite los formatos numéricos más comunes en todo el mundo. No necesita entender inglés para usarla. De forma predeterminada, utiliza el formato numérico inglés y la configuración regional «en». Por lo tanto, debe llegar al menos hasta ese punto en la aplicación; de lo contrario, no será legible.',
    fr: 'Elle est localisée dans une douzaine de langues et prend en charge les formats numériques les plus courants dans le monde. Vous n\'avez pas besoin de comprendre l\'anglais pour l\'utiliser. Par défaut, elle utilise le format numérique anglais et les paramètres régionaux « en ». Vous devez donc au moins aller jusque là dans l\'application ; sinon, elle ne sera pas lisible.',
    it: 'È localizzata in circa una dozzina di lingue e supporta i formati numerici più comuni nel mondo. Non è necessario capire l\'inglese per usarla. Per impostazione predefinita, utilizza il formato numerico inglese e le impostazioni locali «en». Quindi è necessario arrivare almeno fino a quel punto nell\'app; altrimenti non sarà leggibile.',
    pt: 'Está localizado em aproximadamente uma dúzia de idiomas e suporta os formatos numéricos mais comuns em todo o mundo. Você não precisa entender inglês para usá-lo. Por padrão, usa o formato numérico inglês e a localidade «en». Portanto, você precisa chegar pelo menos até esse ponto no aplicativo; caso contrário, não será legível.',
    ru: 'Приложение локализовано примерно на двенадцать языков и поддерживает наиболее распространённые форматы чисел в мире. Понимать английский не обязательно. По умолчанию используется английский формат чисел и языковой стандарт «en». Поэтому нужно добраться хотя бы до этой точки в приложении; иначе оно будет нечитаемым.',
    zh: '该应用已本地化为约十余种语言，并支持全球最常见的数字格式。您无需懂英语即可使用。默认使用英语数字格式和 en 语言环境。因此您需要至少进入应用到这一步；否则界面将无法阅读。',
    ja: 'このアプリは約 12 の言語にローカライズされており、世界の主要な数値フォーマットに対応しています。英語が分からなくても使用できます。デフォルトでは英語の数値フォーマットと「en」ロケールが設定されています。まずアプリのその箇所まで到達する必要があります。そうしないと表示が読めません。',
    ko: '이 앱은 약 12개 언어로 현지화되어 있으며 전 세계에서 가장 일반적인 숫자 형식을 지원합니다. 영어를 이해하지 않아도 사용할 수 있습니다. 기본적으로 영어 숫자 형식과 「en」 로케일로 설정되어 있습니다. 앱에서 최소한 그 부분까지는 접근해야 합니다. 그렇지 않으면 읽을 수 없습니다.'
  },
  'help-para-3': {
    en: "The app has four main panes, only two of which are visible at the same time. The default top is the unit conversion. The bottom pane is an RPN unit-aware calculator. You can paste or type in just about anything, and it will work. The conversions for the output of the calculators are limited to SI base and derived units. To convert further, bring the result back to the conversion pane.",
    ar: 'يحتوي التطبيق على أربع لوحات رئيسية، لا تظهر منها سوى لوحتين في وقت واحد. اللوحة العلوية الافتراضية هي تحويل الوحدات. اللوحة السفلية عبارة عن حاسبة RPN تدرك الوحدات. يمكنك لصق أي شيء تقريباً أو كتابته وسيعمل. تحويلات مخرجات الحاسبات مقيدة بوحدات SI الأساسية والمشتقة. لمزيد من التحويل، أعد النتيجة إلى لوحة التحويل.',
    de: 'Die App verfügt über vier Hauptbereiche, von denen immer zwei gleichzeitig sichtbar sind. Standardmäßig ist oben die Einheitenumrechnung. Der untere Bereich ist ein RPN-Taschenrechner mit Einheitenbewusstsein. Sie können fast alles einfügen oder eintippen, und es wird funktionieren. Die Ausgaben der Rechner sind auf SI-Basis- und abgeleitete Einheiten beschränkt. Für weitere Umrechnungen bringen Sie das Ergebnis in den Umrechnungsbereich zurück.',
    es: 'La aplicación tiene cuatro paneles principales, de los cuales solo dos son visibles a la vez. El panel superior predeterminado es el de conversión de unidades. El panel inferior es una calculadora RPN con reconocimiento de unidades. Puede pegar o escribir casi cualquier cosa y funcionará. Las conversiones para la salida de las calculadoras están limitadas a unidades base e derivadas del SI. Para convertir más, lleve el resultado de vuelta al panel de conversión.',
    fr: 'L\'application dispose de quatre panneaux principaux, dont seulement deux sont visibles à la fois. Le panneau supérieur par défaut est la conversion d\'unités. Le panneau inférieur est une calculatrice RPN avec gestion des unités. Vous pouvez coller ou saisir presque n\'importe quoi et cela fonctionnera. Les conversions pour les sorties des calculatrices sont limitées aux unités de base et dérivées du SI. Pour convertir davantage, ramenez le résultat dans le panneau de conversion.',
    it: 'L\'app ha quattro pannelli principali, di cui solo due sono visibili contemporaneamente. Il pannello superiore predefinito è la conversione delle unità. Il pannello inferiore è una calcolatrice RPN con consapevolezza delle unità. Puoi incollare o digitare praticamente qualsiasi cosa e funzionerà. Le conversioni per l\'output delle calcolatrici sono limitate alle unità base e derivate del SI. Per ulteriori conversioni, riporta il risultato nel pannello di conversione.',
    pt: 'O aplicativo tem quatro painéis principais, dos quais apenas dois são visíveis de cada vez. O painel superior padrão é a conversão de unidades. O painel inferior é uma calculadora RPN com reconhecimento de unidades. Você pode colar ou digitar quase qualquer coisa e vai funcionar. As conversões para a saída das calculadoras estão limitadas às unidades base e derivadas do SI. Para converter mais, traga o resultado de volta ao painel de conversão.',
    ru: 'Приложение имеет четыре основные панели, из которых одновременно видны только две. По умолчанию верхняя — конвертер единиц. Нижняя панель — RPN-калькулятор с поддержкой единиц. Можно вставить или ввести практически что угодно — всё будет работать. Вывод калькуляторов ограничен базовыми и производными единицами СИ. Для дальнейших преобразований верните результат в панель конвертера.',
    zh: '该应用有四个主要面板，同时只显示两个。默认上方为单位转换面板，下方为支持单位的 RPN 计算器。几乎可以粘贴或输入任何内容，均可正常处理。计算器的输出仅限于 SI 基本单位和导出单位。如需进一步转换，请将结果带回转换面板。',
    ja: 'アプリには 4 つのメインパネルがあり、同時に 2 つだけが表示されます。デフォルトでは上部が単位変換パネル、下部が単位対応の RPN 計算機です。ほぼ何でも貼り付けるか入力すれば動作します。計算機の出力は SI の基本単位と導出単位に限られます。さらに変換するには、結果を変換パネルに戻してください。',
    ko: '이 앱에는 네 개의 주요 패널이 있으며, 동시에 두 개만 표시됩니다. 기본적으로 상단은 단위 변환 패널이고, 하단은 단위 인식 RPN 계산기입니다. 거의 모든 것을 붙여넣거나 입력할 수 있으며 작동합니다. 계산기 출력은 SI 기본 단위 및 유도 단위로 제한됩니다. 추가 변환이 필요하면 결과를 변환 패널로 가져오세요.'
  },
  'help-para-4': {
    en: "There are two additional panes. You can swap out the conversion pane for a build-your-own unit. You can paste in just about anything (like the calculator), and it will reduce that to a base SI expression. You can take it from there. There's also a very simple calculator that will handle most unit arithmetic if you don't like RPN calculators.",
    ar: 'هناك لوحتان إضافيتان. يمكنك استبدال لوحة التحويل بأداة لبناء وحداتك الخاصة. يمكنك لصق أي شيء تقريباً (كالحاسبة) وسيُقلَّص إلى تعبير SI أساسي. يمكنك الاستمرار من هناك. يوجد أيضاً حاسبة بسيطة للغاية للتعامل مع معظم عمليات الوحدات الحسابية إذا كنت لا تفضل حاسبات RPN.',
    de: 'Es gibt zwei zusätzliche Bereiche. Sie können den Umrechnungsbereich durch einen Baukasten für benutzerdefinierte Einheiten ersetzen. Sie können fast alles einfügen (wie beim Taschenrechner) — es wird auf einen SI-Basisausdruck reduziert. Von dort aus können Sie weiterarbeiten. Es gibt auch einen sehr einfachen Rechner für die meisten Einheitenarithmetiken, wenn Sie keine RPN-Taschenrechner mögen.',
    es: 'Hay dos paneles adicionales. Puede reemplazar el panel de conversión por un constructor de unidades personalizadas. Puede pegar casi cualquier cosa (como en la calculadora) y lo reducirá a una expresión base SI. Puede continuar desde ahí. También hay una calculadora muy simple para la mayoría de la aritmética de unidades si no le gustan las calculadoras RPN.',
    fr: 'Il y a deux panneaux supplémentaires. Vous pouvez remplacer le panneau de conversion par un constructeur d\'unités personnalisées. Vous pouvez y coller presque n\'importe quoi (comme avec la calculatrice) et il le réduira à une expression de base SI. Vous pouvez partir de là. Il y a aussi une calculatrice très simple pour la plupart des opérations arithmétiques sur les unités si vous n\'aimez pas les calculatrices RPN.',
    it: 'Ci sono due pannelli aggiuntivi. Puoi sostituire il pannello di conversione con un costruttore di unità personalizzate. Puoi incollare praticamente qualsiasi cosa (come con la calcolatrice) e lo ridurrà a un\'espressione base SI. Da lì puoi proseguire. C\'è anche una calcolatrice molto semplice per la maggior parte dell\'aritmetica delle unità se non ti piacciono le calcolatrici RPN.',
    pt: 'Há dois painéis adicionais. Você pode substituir o painel de conversão por um construtor de unidades personalizadas. Você pode colar quase qualquer coisa (como na calculadora) e ele reduzirá a uma expressão base SI. Pode continuar a partir daí. Há também uma calculadora muito simples para a maior parte da aritmética de unidades se você não gostar de calculadoras RPN.',
    ru: 'Есть два дополнительных раздела. Можно заменить панель конвертера конструктором пользовательских единиц. Вставьте практически что угодно (как в калькулятор) — это будет сведено к выражению в базовых единицах СИ. Дальше можно продолжить самостоятельно. Также есть очень простой калькулятор для стандартных операций с единицами, если RPN вам не по душе.',
    zh: '还有两个额外的面板。您可以将转换面板替换为自定义单位构建器——粘贴几乎任何内容（就像计算器一样），它会将其简化为 SI 基本表达式。您可以从那里继续操作。如果您不喜欢 RPN 计算器，还有一个非常简单的计算器，可处理大多数单位运算。',
    ja: '追加のパネルが 2 つあります。変換パネルをカスタム単位ビルダーに切り替えることができます。ほぼ何でも貼り付けると（計算機と同様に）SI の基本式に変換されます。そこから先は自分で続けられます。RPN 計算機が好みでない場合は、基本的な単位演算をカバーするシンプルな計算機もあります。',
    ko: '추가 패널이 두 개 있습니다. 변환 패널을 사용자 단위 빌더로 교체할 수 있습니다. 거의 모든 것을 붙여넣으면(계산기처럼) SI 기본 표현식으로 축소됩니다. 거기서부터 계속 진행할 수 있습니다. RPN 계산기가 마음에 들지 않는다면 대부분의 단위 산술을 처리하는 매우 간단한 계산기도 있습니다.'
  },
  'help-para-5': {
    en: "The app is a single, standalone .html file. It references no other files and has no links. You can bring it anywhere you have a browser, and it will work. No network or packaging needed. I've also provided a GitHub repository with the project. It's a bog-standard TypeScript/React project. I built it on Replit, but that's not required. You're free to use the .html file or the source code any way you want.",
    ar: 'التطبيق عبارة عن ملف HTML واحد مستقل. لا يشير إلى ملفات أخرى وليس فيه روابط. يمكنك أخذه إلى أي مكان يوجد فيه متصفح وسيعمل. لا حاجة لشبكة أو حزم. قدمت أيضاً مستودع GitHub للمشروع. إنه مشروع TypeScript/React قياسي. بنيته على Replit، لكن ذلك غير مطلوب. أنت حر في استخدام ملف HTML أو الكود المصدري بأي طريقة تريد.',
    de: 'Die App ist eine einzelne, eigenständige .html-Datei. Sie verweist auf keine anderen Dateien und enthält keine Links. Sie können sie überall nutzen, wo ein Browser vorhanden ist, und es wird funktionieren. Kein Netzwerk oder Packaging nötig. Ich habe auch ein GitHub-Repository mit dem Projekt bereitgestellt. Es ist ein Standard-TypeScript/React-Projekt, auf Replit entwickelt, aber das ist keine Voraussetzung. Sie können die .html-Datei oder den Quellcode beliebig verwenden.',
    es: 'La aplicación es un único archivo .html independiente. No hace referencia a otros archivos ni tiene enlaces. Puede llevarlo a cualquier lugar con navegador y funcionará. No se necesita red ni empaquetado. También he proporcionado un repositorio de GitHub con el proyecto. Es un proyecto TypeScript/React estándar construido en Replit, pero eso no es un requisito. Puede usar el archivo .html o el código fuente como desee.',
    fr: 'L\'application est un seul fichier .html autonome. Il ne référence aucun autre fichier et ne contient aucun lien. Vous pouvez l\'amener n\'importe où avec un navigateur et ça fonctionnera. Aucun réseau ni packaging nécessaire. J\'ai également fourni un dépôt GitHub avec le projet. C\'est un projet TypeScript/React standard, développé sur Replit, mais ce n\'est pas obligatoire. Vous êtes libre d\'utiliser le fichier .html ou le code source comme vous le souhaitez.',
    it: 'L\'app è un singolo file .html autonomo. Non fa riferimento ad altri file e non ha link. Puoi portarlo ovunque ci sia un browser e funzionerà. Non è necessaria rete o packaging. Ho anche fornito un repository GitHub con il progetto. È un progetto TypeScript/React standard sviluppato su Replit, ma non è un requisito. Sei libero di usare il file .html o il codice sorgente come preferisci.',
    pt: 'O aplicativo é um único arquivo .html independente. Não faz referência a outros arquivos e não tem links. Pode levá-lo a qualquer lugar com um navegador e funcionará. Sem necessidade de rede ou empacotamento. Também forneci um repositório GitHub com o projeto. É um projeto TypeScript/React padrão desenvolvido no Replit, mas isso não é um requisito. Você é livre para usar o arquivo .html ou o código-fonte como quiser.',
    ru: 'Приложение — единственный автономный файл .html. Он не ссылается на другие файлы и не содержит ссылок. Его можно взять куда угодно, где есть браузер, и всё будет работать. Никакой сети или упаковки не требуется. Я также предоставил репозиторий GitHub с проектом. Это стандартный проект TypeScript/React, созданный на Replit, но это не обязательное условие. Вы можете использовать файл .html или исходный код в любых целях.',
    zh: '该应用是一个单独的独立 .html 文件，不引用其他文件，也没有链接。您可以带到任何有浏览器的地方，它都能运行。无需网络或打包。我还提供了一个 GitHub 仓库。这是一个标准的 TypeScript/React 项目，在 Replit 上构建，但并非必需。您可以自由使用 .html 文件或源代码。',
    ja: 'アプリは単一の独立した .html ファイルです。他のファイルを参照せず、リンクもありません。ブラウザがある場所ならどこにでも持ち運べ、動作します。ネットワークやパッケージングは不要です。GitHub リポジトリも公開しています。標準的な TypeScript/React プロジェクトで Replit で構築しましたが、それは必須ではありません。.html ファイルやソースコードは自由に使用できます。',
    ko: '이 앱은 단일 독립형 .html 파일입니다. 다른 파일을 참조하지 않으며 링크가 없습니다. 브라우저가 있는 어디서나 가져가서 사용할 수 있습니다. 네트워크나 패키징이 필요 없습니다. GitHub 저장소도 제공합니다. 표준 TypeScript/React 프로젝트로 Replit에서 구축했지만 필수는 아닙니다. .html 파일이나 소스 코드를 원하는 방식으로 자유롭게 사용하세요.'
  },
  'help-github-note': {
    en: "This is the only hyperlink or external reference in the .html distribution. You can click on it or not. It's not part of the app.",
    ar: 'هذا هو الرابط الوحيد أو المرجع الخارجي في توزيعة .html. يمكنك النقر عليه أو تجاهله. إنه ليس جزءاً من التطبيق.',
    de: 'Dies ist der einzige Hyperlink bzw. externe Verweis in der .html-Distribution. Sie können darauf klicken oder nicht. Es ist nicht Teil der App.',
    es: 'Este es el único hipervínculo o referencia externa en la distribución .html. Puede hacer clic en él o no. No es parte de la aplicación.',
    fr: 'C\'est le seul lien hypertexte ou référence externe dans la distribution .html. Vous pouvez cliquer dessus ou non. Ce n\'est pas une partie de l\'application.',
    it: 'Questo è l\'unico collegamento ipertestuale o riferimento esterno nella distribuzione .html. Puoi cliccarlo o ignorarlo. Non fa parte dell\'app.',
    pt: 'Este é o único hiperlink ou referência externa na distribuição .html. Você pode clicar nele ou não. Não faz parte do aplicativo.',
    ru: 'Это единственная гиперссылка или внешняя ссылка в дистрибутиве .html. Можно нажать на неё или нет — на работу приложения это не влияет.',
    zh: '这是 .html 发行版中唯一的超链接或外部引用，点击与否均可，与应用本身无关。',
    ja: 'これは .html 配布ファイル内で唯一のハイパーリンクまたは外部参照です。クリックしてもしなくても構いません。アプリの機能とは無関係です。',
    ko: '이것은 .html 배포판에서 유일한 하이퍼링크 또는 외부 참조입니다. 클릭해도 되고 안 해도 됩니다. 앱의 일부가 아닙니다.'
  },
  'help-llm-note': {
    en: "Note: I used an AI assistant to build most of this. It has been tested and includes unit tests. To the best of my knowledge the conversions are correct, but your mileage may vary.",
    ar: 'ملاحظة: تم بناء معظم هذا التطبيق بمساعدة نموذج ذكاء اصطناعي. تم اختباره ويتضمن اختبارات وحدة. حسب علمي، التحويلات صحيحة — لكن تحقق بنفسك في التطبيقات الحساسة.',
    de: 'Hinweis: Diese App wurde größtenteils mithilfe eines KI-Assistenten erstellt. Sie wurde getestet und enthält Unit-Tests. Soweit ich weiß, sind die Umrechnungen korrekt — aber für kritische Anwendungen bitte selbst prüfen.',
    es: 'Nota: Esta aplicación fue construida en su mayor parte con la ayuda de un asistente de IA. Ha sido probada e incluye pruebas unitarias. Hasta donde sé, las conversiones son correctas, pero compruébelo usted mismo en aplicaciones críticas.',
    fr: 'Note : Cette application a été construite en grande partie à l\'aide d\'un assistant IA. Elle a été testée et inclut des tests unitaires. À ma connaissance, les conversions sont correctes, mais vérifiez par vous-même pour les applications critiques.',
    it: 'Nota: Questa app è stata costruita in gran parte con l\'aiuto di un assistente AI. È stata testata e include unit test. Per quanto ne so, le conversioni sono corrette, ma verificatelo autonomamente per applicazioni critiche.',
    pt: 'Nota: Este aplicativo foi construído em grande parte com a ajuda de um assistente de IA. Foi testado e inclui testes unitários. Até onde sei, as conversões estão corretas, mas verifique por conta própria em aplicações críticas.',
    ru: 'Примечание: это приложение создано в основном с помощью ИИ-ассистента. Оно протестировано и включает юнит-тесты. Насколько мне известно, конвертации выполнены верно, но для критически важных задач проверяйте самостоятельно.',
    zh: '注意：该应用主要借助 AI 助手构建，已通过测试并包含单元测试。据我所知转换结果正确，但对于关键应用请自行验证。',
    ja: '注記：このアプリは主に AI アシスタントの助けを借りて構築されました。テスト済みでユニットテストも含まれています。私の知る限り変換結果は正しいですが、重要な用途では自身で確認してください。',
    ko: '참고: 이 앱은 주로 AI 어시스턴트의 도움으로 제작되었습니다. 테스트를 거쳤으며 단위 테스트도 포함되어 있습니다. 제가 아는 한 변환은 정확하지만, 중요한 용도에는 직접 확인하세요.'
  },
  'help-machine-translated': {
    en: '',
    ar: '(تمت ترجمة هذا النص آلياً. للاطلاع على النص الأصلي، يمكنك التبديل إلى اللغة «en».)',
    de: '(Dieser Text wurde maschinell übersetzt. Für den Originaltext wechseln Sie bitte zur Sprache «en».)',
    es: '(Este texto fue traducido automáticamente. Para ver el texto original, cambie al idioma «en».)',
    fr: '(Ce texte a été traduit automatiquement. Pour le texte original, passez à la langue « en ».)',
    it: '(Questo testo è stato tradotto automaticamente. Per il testo originale, passa alla lingua «en».)',
    pt: '(Este texto foi traduzido automaticamente. Para o texto original, mude para o idioma «en».)',
    ru: '(Этот текст переведён автоматически. Для оригинала переключитесь на язык «en».)',
    zh: '（本文为机器翻译。如需原文，请切换到「en」语言环境。）',
    ja: '（このテキストは機械翻訳です。原文は「en」ロケールに切り替えてご確認ください。）',
    ko: '（이 텍스트는 기계 번역되었습니다. 원문을 보려면 «en» 로케일로 전환하세요.）'
  },
};

export const UNIT_NAME_TRANSLATIONS: Record<string, Translation> = {
  'Meter': { 
    en: 'Meter', ar: 'متر', de: 'Meter',
    es: 'Metro', fr: 'Mètre', it: 'Metro',
    pt: 'Metro', ru: 'Метр', zh: '米', ja: 'メートル', ko: '미터'
  },
  'Kilogram': { 
    en: 'Kilogram', ar: 'كيلوغرام', de: 'Kilogramm',
    es: 'Kilogramo', fr: 'Kilogramme', it: 'Chilogrammo',
    pt: 'Quilograma', ru: 'Килограмм', zh: '千克', ja: 'キログラム', ko: '킬로그램'
  },
  'Gram': { 
    en: 'Gram', ar: 'غرام', de: 'Gramm',
    es: 'Gramo', fr: 'Gramme', it: 'Grammo',
    pt: 'Grama', ru: 'Грамм', zh: '克', ja: 'グラム', ko: '그램'
  },
  'Second': { 
    en: 'Second', ar: 'ثانية', de: 'Sekunde',
    es: 'Segundo', fr: 'Seconde', it: 'Secondo',
    pt: 'Segundo', ru: 'Секунда', zh: '秒', ja: '秒', ko: '초'
  },
  'Minute': { 
    en: 'Minute', ar: 'دقيقة', de: 'Minute',
    es: 'Minuto', fr: 'Minute', it: 'Minuto',
    pt: 'Minuto', ru: 'Минута', zh: '分', ja: '分', ko: '분'
  },
  'Hour': { 
    en: 'Hour', ar: 'ساعة', de: 'Stunde',
    es: 'Hora', fr: 'Heure', it: 'Ora',
    pt: 'Hora', ru: 'Час', zh: '时', ja: '時間', ko: '시간'
  },
  'Day': { 
    en: 'Day', ar: 'يوم', de: 'Tag',
    es: 'Día', fr: 'Jour', it: 'Giorno',
    pt: 'Dia', ru: 'День', zh: '天', ja: '日', ko: '일'
  },
  'Week': { 
    en: 'Week', ar: 'أسبوع', de: 'Woche',
    es: 'Semana', fr: 'Semaine', it: 'Settimana',
    pt: 'Semana', ru: 'Неделя', zh: '周', ja: '週', ko: '주'
  },
  'Year': { 
    en: 'Year', ar: 'سنة', de: 'Jahr',
    es: 'Año', fr: 'Année', it: 'Anno',
    pt: 'Ano', ru: 'Год', zh: '年', ja: '年', ko: '년'
  },
  'Ampere': { 
    en: 'Ampere', ar: 'أمبير', de: 'Ampere',
    es: 'Amperio', fr: 'Ampère', it: 'Ampere',
    pt: 'Ampere', ru: 'Ампер', zh: '安培', ja: 'アンペア', ko: '암페어'
  },
  'Newton': { 
    en: 'Newton', ar: 'نيوتن', de: 'Newton',
    es: 'Newton', fr: 'Newton', it: 'Newton',
    pt: 'Newton', ru: 'Ньютон', zh: '牛顿', ja: 'ニュートン', ko: '뉴턴'
  },
  'Joule': { 
    en: 'Joule', ar: 'جول', de: 'Joule',
    es: 'Julio', fr: 'Joule', it: 'Joule',
    pt: 'Joule', ru: 'Джоуль', zh: '焦耳', ja: 'ジュール', ko: '줄'
  },
  'Electronvolt': { 
    en: 'Electronvolt', ar: 'إلكترون فولت', de: 'Elektronenvolt',
    es: 'Electronvoltio', fr: 'Électron-volt', it: 'Elettronvolt',
    pt: 'Elétron-volt', ru: 'Электронвольт', zh: '电子伏特', ja: '電子ボルト', ko: '전자볼트'
  },
  'Frequency (ν)': { 
    en: 'Frequency (ν)', ar: 'التردد (ν)', de: 'Frequenz (ν)',
    es: 'Frecuencia (ν)', fr: 'Fréquence (ν)', it: 'Frequenza (ν)',
    pt: 'Frequência (ν)', ru: 'Частота (ν)', zh: '频率 (ν)', ja: '周波数 (ν)', ko: '주파수 (ν)'
  },
  'Wavelength (λ)': { 
    en: 'Wavelength (λ)', ar: 'الطول الموجي (λ)', de: 'Wellenlänge (λ)',
    es: 'Longitud de Onda (λ)', fr: 'Longueur d\'Onde (λ)', it: 'Lunghezza d\'Onda (λ)',
    pt: 'Comprimento de Onda (λ)', ru: 'Длина Волны (λ)', zh: '波长 (λ)', ja: '波長 (λ)', ko: '파장 (λ)'
  },
  'Watt': { 
    en: 'Watt', ar: 'واط', de: 'Watt',
    es: 'Vatio', fr: 'Watt', it: 'Watt',
    pt: 'Watt', ru: 'Ватт', zh: '瓦特', ja: 'ワット', ko: '와트'
  },
  'Hertz': { 
    en: 'Hertz', ar: 'هرتز', de: 'Hertz',
    es: 'Hercio', fr: 'Hertz', it: 'Hertz',
    pt: 'Hertz', ru: 'Герц', zh: '赫兹', ja: 'ヘルツ', ko: '헤르츠'
  },
  'Pascal': { 
    en: 'Pascal', ar: 'باسكال', de: 'Pascal',
    es: 'Pascal', fr: 'Pascal', it: 'Pascal',
    pt: 'Pascal', ru: 'Паскаль', zh: '帕斯卡', ja: 'パスカル', ko: '파스칼'
  },
  'Coulomb': { 
    en: 'Coulomb', ar: 'كولوم', de: 'Coulomb',
    es: 'Culombio', fr: 'Coulomb', it: 'Coulomb',
    pt: 'Coulomb', ru: 'Кулон', zh: '库仑', ja: 'クーロン', ko: '쿨롱'
  },
  'Volt': { 
    en: 'Volt', ar: 'فولت', de: 'Volt',
    es: 'Voltio', fr: 'Volt', it: 'Volt',
    pt: 'Volt', ru: 'Вольт', zh: '伏特', ja: 'ボルト', ko: '볼트'
  },
  'Farad': { 
    en: 'Farad', ar: 'فاراد', de: 'Farad',
    es: 'Faradio', fr: 'Farad', it: 'Farad',
    pt: 'Farad', ru: 'Фарад', zh: '法拉', ja: 'ファラド', ko: '패럿'
  },
  'Ohm': { 
    en: 'Ohm', ar: 'أوم', de: 'Ohm',
    es: 'Ohmio', fr: 'Ohm', it: 'Ohm',
    pt: 'Ohm', ru: 'Ом', zh: '欧姆', ja: 'オーム', ko: '옴'
  },
  'Siemens': { 
    en: 'Siemens', ar: 'سيمنز', de: 'Siemens',
    es: 'Siemens', fr: 'Siemens', it: 'Siemens',
    pt: 'Siemens', ru: 'Сименс', zh: '西门子', ja: 'ジーメンス', ko: '지멘스'
  },
  'Henry': { 
    en: 'Henry', ar: 'هنري', de: 'Henry',
    es: 'Henrio', fr: 'Henry', it: 'Henry',
    pt: 'Henry', ru: 'Генри', zh: '亨利', ja: 'ヘンリー', ko: '헨리'
  },
  'Weber': { 
    en: 'Weber', ar: 'ويبر', de: 'Weber',
    es: 'Weber', fr: 'Weber', it: 'Weber',
    pt: 'Weber', ru: 'Вебер', zh: '韦伯', ja: 'ウェーバ', ko: '웨버'
  },
  'Tesla': { 
    en: 'Tesla', ar: 'تسلا', de: 'Tesla',
    es: 'Tesla', fr: 'Tesla', it: 'Tesla',
    pt: 'Tesla', ru: 'Тесла', zh: '特斯拉', ja: 'テスラ', ko: '테슬라'
  },
  'Lumen': { 
    en: 'Lumen', ar: 'لومن', de: 'Lumen',
    es: 'Lumen', fr: 'Lumen', it: 'Lumen',
    pt: 'Lúmen', ru: 'Люмен', zh: '流明', ja: 'ルーメン', ko: '루멘'
  },
  'Lux': { 
    en: 'Lux', ar: 'لوكس', de: 'Lux',
    es: 'Lux', fr: 'Lux', it: 'Lux',
    pt: 'Lux', ru: 'Люкс', zh: '勒克斯', ja: 'ルクス', ko: '럭스'
  },
  'Candela': { 
    en: 'Candela', ar: 'شمعة', de: 'Candela',
    es: 'Candela', fr: 'Candela', it: 'Candela',
    pt: 'Candela', ru: 'Кандела', zh: '坎德拉', ja: 'カンデラ', ko: '칸델라'
  },
  'Mole': { 
    en: 'Mole', ar: 'مول', de: 'Mol',
    es: 'Mol', fr: 'Mole', it: 'Mole',
    pt: 'Mol', ru: 'Моль', zh: '摩尔', ja: 'モル', ko: '몰'
  },
  'Becquerel': { 
    en: 'Becquerel', ar: 'بيكريل', de: 'Becquerel',
    es: 'Becquerel', fr: 'Becquerel', it: 'Becquerel',
    pt: 'Becquerel', ru: 'Беккерель', zh: '贝克勒尔', ja: 'ベクレル', ko: '베크렐'
  },
  'Gray': { 
    en: 'Gray', ar: 'غراي', de: 'Gray',
    es: 'Gray', fr: 'Gray', it: 'Gray',
    pt: 'Gray', ru: 'Грей', zh: '戈瑞', ja: 'グレイ', ko: '그레이'
  },
  'Sievert': { 
    en: 'Sievert', ar: 'سيفرت', de: 'Sievert',
    es: 'Sievert', fr: 'Sievert', it: 'Sievert',
    pt: 'Sievert', ru: 'Зиверт', zh: '希沃特', ja: 'シーベルト', ko: '시버트'
  },
  'Radian': { 
    en: 'Radian', ar: 'راديان', de: 'Radiant',
    es: 'Radián', fr: 'Radian', it: 'Radiante',
    pt: 'Radiano', ru: 'Радиан', zh: '弧度', ja: 'ラジアン', ko: '라디안'
  },
  'Degree': { 
    en: 'Degree', ar: 'درجة', de: 'Grad',
    es: 'Grado', fr: 'Degré', it: 'Grado',
    pt: 'Grau', ru: 'Градус', zh: '度', ja: '度', ko: '도'
  },
  'Steradian': { 
    en: 'Steradian', ar: 'ستيراديان', de: 'Steradiant',
    es: 'Estereorradián', fr: 'Stéradian', it: 'Steradiante',
    pt: 'Esferorradiano', ru: 'Стерадиан', zh: '球面度', ja: 'ステラジアン', ko: '스테라디안'
  },
  'Kelvin': { 
    en: 'Kelvin', ar: 'كلفن', de: 'Kelvin',
    es: 'Kelvin', fr: 'Kelvin', it: 'Kelvin',
    pt: 'Kelvin', ru: 'Кельвин', zh: '开尔文', ja: 'ケルビン', ko: '켈빈'
  },
  'Celsius': { 
    en: 'Celsius', ar: 'مئوية', de: 'Celsius',
    es: 'Celsius', fr: 'Celsius', it: 'Celsius',
    pt: 'Celsius', ru: 'Цельсий', zh: '摄氏度', ja: '摂氏', ko: '섭씨'
  },
  'Fahrenheit': { 
    en: 'Fahrenheit', ar: 'فهرنهايت', de: 'Fahrenheit',
    es: 'Fahrenheit', fr: 'Fahrenheit', it: 'Fahrenheit',
    pt: 'Fahrenheit', ru: 'Фаренгейт', zh: '华氏度', ja: '華氏', ko: '화씨'
  },
  'Litre': { 
    en: 'Litre', ar: 'لتر', de: 'Liter',
    es: 'Litro', fr: 'Litre', it: 'Litro',
    pt: 'Litro', ru: 'Литр', zh: '升', ja: 'リットル', ko: '리터'
  },
  'Square Metre': { 
    en: 'Square Metre', ar: 'متر مربع', de: 'Quadratmeter',
    es: 'Metro Cuadrado', fr: 'Mètre Carré', it: 'Metro Quadrato',
    pt: 'Metro Quadrado', ru: 'Квадратный Метр', zh: '平方米', ja: '平方メートル', ko: '제곱미터'
  },
  'Cubic Metre': { 
    en: 'Cubic Metre', ar: 'متر مكعب', de: 'Kubikmeter',
    es: 'Metro Cúbico', fr: 'Mètre Cube', it: 'Metro Cubo',
    pt: 'Metro Cúbico', ru: 'Кубический Метр', zh: '立方米', ja: '立方メートル', ko: '세제곱미터'
  },
  'Hectare': { 
    en: 'Hectare', ar: 'هكتار', de: 'Hektar',
    es: 'Hectárea', fr: 'Hectare', it: 'Ettaro',
    pt: 'Hectare', ru: 'Гектар', zh: '公顷', ja: 'ヘクタール', ko: '헥타르'
  },
  'Inch': { 
    en: 'Inch', ar: 'بوصة', de: 'Zoll',
    es: 'Pulgada', fr: 'Pouce', it: 'Pollice',
    pt: 'Polegada', ru: 'Дюйм', zh: '英寸', ja: 'インチ', ko: '인치'
  },
  'Foot': { 
    en: 'Foot', ar: 'قدم', de: 'Fuß',
    es: 'Pie', fr: 'Pied', it: 'Piede',
    pt: 'Pé', ru: 'Фут', zh: '英尺', ja: 'フィート', ko: '피트'
  },
  'Yard': { 
    en: 'Yard', ar: 'ياردة', de: 'Yard',
    es: 'Yarda', fr: 'Yard', it: 'Iarda',
    pt: 'Jarda', ru: 'Ярд', zh: '码', ja: 'ヤード', ko: '야드'
  },
  'Mile': { 
    en: 'Mile', ar: 'ميل', de: 'Meile',
    es: 'Milla', fr: 'Mile', it: 'Miglio',
    pt: 'Milha', ru: 'Миля', zh: '英里', ja: 'マイル', ko: '마일'
  },
  'Ounce': { 
    en: 'Ounce', ar: 'أونصة', de: 'Unze',
    es: 'Onza', fr: 'Once', it: 'Oncia',
    pt: 'Onça', ru: 'Унция', zh: '盎司', ja: 'オンス', ko: '온스'
  },
  'Pound': { 
    en: 'Pound', ar: 'رطل', de: 'Pfund',
    es: 'Libra', fr: 'Livre', it: 'Libbra',
    pt: 'Libra', ru: 'Фунт', zh: '磅', ja: 'ポンド', ko: '파운드'
  },
  'Ton': { 
    en: 'Ton', ar: 'طن', de: 'Tonne',
    es: 'Tonelada', fr: 'Tonne', it: 'Tonnellata',
    pt: 'Tonelada', ru: 'Тонна', zh: '吨', ja: 'トン', ko: '톤'
  },
  'Gallon': { 
    en: 'Gallon', ar: 'جالون', de: 'Gallone',
    es: 'Galón', fr: 'Gallon', it: 'Gallone',
    pt: 'Galão', ru: 'Галлон', zh: '加仑', ja: 'ガロン', ko: '갤런'
  },
  'Pint': { 
    en: 'Pint', ar: 'باينت', de: 'Pinte',
    es: 'Pinta', fr: 'Pinte', it: 'Pinta',
    pt: 'Pinta', ru: 'Пинта', zh: '品脱', ja: 'パイント', ko: '파인트'
  },
  'Cup': { 
    en: 'Cup', ar: 'كوب', de: 'Tasse',
    es: 'Taza', fr: 'Tasse', it: 'Tazza',
    pt: 'Xícara', ru: 'Чашка', zh: '杯', ja: 'カップ', ko: '컵'
  },
  'Tablespoon': { 
    en: 'Tablespoon', ar: 'ملعقة كبيرة', de: 'Esslöffel',
    es: 'Cucharada', fr: 'Cuillère à Soupe', it: 'Cucchiaio',
    pt: 'Colher de Sopa', ru: 'Столовая Ложка', zh: '汤匙', ja: '大さじ', ko: '큰술'
  },
  'Teaspoon': { 
    en: 'Teaspoon', ar: 'ملعقة صغيرة', de: 'Teelöffel',
    es: 'Cucharadita', fr: 'Cuillère à Café', it: 'Cucchiaino',
    pt: 'Colher de Chá', ru: 'Чайная Ложка', zh: '茶匙', ja: '小さじ', ko: '작은술'
  },
  'Calorie': { 
    en: 'Calorie', ar: 'سعرة حرارية', de: 'Kalorie',
    es: 'Caloría', fr: 'Calorie', it: 'Caloria',
    pt: 'Caloria', ru: 'Калория', zh: '卡路里', ja: 'カロリー', ko: '칼로리'
  },
  'Kilocalorie': { 
    en: 'Kilocalorie', ar: 'كيلوسعرة', de: 'Kilokalorie',
    es: 'Kilocaloría', fr: 'Kilocalorie', it: 'Chilocaloria',
    pt: 'Quilocaloria', ru: 'Килокалория', zh: '千卡', ja: 'キロカロリー', ko: '킬로칼로리'
  },
  'Horsepower': { 
    en: 'Horsepower', ar: 'حصان', de: 'Pferdestärke',
    es: 'Caballo de Fuerza', fr: 'Cheval-vapeur', it: 'Cavallo Vapore',
    pt: 'Cavalo-vapor', ru: 'Лошадиная Сила', zh: '马力', ja: '馬力', ko: '마력'
  },
  'Bar': { 
    en: 'Bar', ar: 'بار', de: 'Bar',
    es: 'Bar', fr: 'Bar', it: 'Bar',
    pt: 'Bar', ru: 'Бар', zh: '巴', ja: 'バール', ko: '바'
  },
  'Atmosphere': { 
    en: 'Atmosphere', ar: 'جو', de: 'Atmosphäre',
    es: 'Atmósfera', fr: 'Atmosphère', it: 'Atmosfera',
    pt: 'Atmosfera', ru: 'Атмосфера', zh: '大气压', ja: '気圧', ko: '기압'
  },
  'Knot': { 
    en: 'Knot', ar: 'عقدة', de: 'Knoten',
    es: 'Nudo', fr: 'Nœud', it: 'Nodo',
    pt: 'Nó', ru: 'Узел', zh: '节', ja: 'ノット', ko: '노트'
  },
  'Byte': { 
    en: 'Byte', ar: 'بايت', de: 'Byte',
    es: 'Byte', fr: 'Octet', it: 'Byte',
    pt: 'Byte', ru: 'Байт', zh: '字节', ja: 'バイト', ko: '바이트'
  },
  'Bit': { 
    en: 'Bit', ar: 'بت', de: 'Bit',
    es: 'Bit', fr: 'Bit', it: 'Bit',
    pt: 'Bit', ru: 'Бит', zh: '比特', ja: 'ビット', ko: '비트'
  },
  'Sun (Japan)': { 
    en: 'Sun (Japan)', ar: 'سون (اليابان)', de: 'Sun (Japan)',
    es: 'Sun (Japón)', fr: 'Sun (Japon)', it: 'Sun (Giappone)',
    pt: 'Sun (Japão)', ru: 'Сун (Япония)', zh: '寸（日本）', ja: '寸', ko: '촌 (일본)'
  },
  'Shaku (Japan)': { 
    en: 'Shaku (Japan)', ar: 'شاكو (اليابان)', de: 'Shaku (Japan)',
    es: 'Shaku (Japón)', fr: 'Shaku (Japon)', it: 'Shaku (Giappone)',
    pt: 'Shaku (Japão)', ru: 'Сяку (Япония)', zh: '尺（日本）', ja: '尺', ko: '자 (일본)'
  },
  'Ken (Japan)': { 
    en: 'Ken (Japan)', ar: 'كين (اليابان)', de: 'Ken (Japan)',
    es: 'Ken (Japón)', fr: 'Ken (Japon)', it: 'Ken (Giappone)',
    pt: 'Ken (Japão)', ru: 'Кэн (Япония)', zh: '间（日本）', ja: '間', ko: '간 (일본)'
  },
  'Jō (Japan)': { 
    en: 'Jō (Japan)', ar: 'جو (اليابان)', de: 'Jō (Japan)',
    es: 'Jō (Japón)', fr: 'Jō (Japon)', it: 'Jō (Giappone)',
    pt: 'Jō (Japão)', ru: 'Дзё (Япония)', zh: '丈（日本）', ja: '丈', ko: '장 (일본)'
  },
  'Ri (Japan)': { 
    en: 'Ri (Japan)', ar: 'ري (اليابان)', de: 'Ri (Japan)',
    es: 'Ri (Japón)', fr: 'Ri (Japon)', it: 'Ri (Giappone)',
    pt: 'Ri (Japão)', ru: 'Ри (Япония)', zh: '里（日本）', ja: '里', ko: '리 (일본)'
  },
  'Fun (Japan)': { 
    en: 'Fun (Japan)', ar: 'فن (اليابان)', de: 'Fun (Japan)',
    es: 'Fun (Japón)', fr: 'Fun (Japon)', it: 'Fun (Giappone)',
    pt: 'Fun (Japão)', ru: 'Фун (Япония)', zh: '分（日本）', ja: '分', ko: '푼 (일본)'
  },
  'Momme (Japan)': { 
    en: 'Momme (Japan)', ar: 'مومي (اليابان)', de: 'Momme (Japan)',
    es: 'Momme (Japón)', fr: 'Momme (Japon)', it: 'Momme (Giappone)',
    pt: 'Momme (Japão)', ru: 'Моммэ (Япония)', zh: '匁（日本）', ja: '匁', ko: '몸메 (일본)'
  },
  'Ryō (Japan)': { 
    en: 'Ryō (Japan)', ar: 'ريو (اليابان)', de: 'Ryō (Japan)',
    es: 'Ryō (Japón)', fr: 'Ryō (Japon)', it: 'Ryō (Giappone)',
    pt: 'Ryō (Japão)', ru: 'Рё (Япония)', zh: '两（日本）', ja: '両', ko: '료 (일본)'
  },
  'Kan (Japan)': { 
    en: 'Kan (Japan)', ar: 'كان (اليابان)', de: 'Kan (Japan)',
    es: 'Kan (Japón)', fr: 'Kan (Japon)', it: 'Kan (Giappone)',
    pt: 'Kan (Japão)', ru: 'Кан (Япония)', zh: '贯（日本）', ja: '貫', ko: '관 (일본)'
  },
  'Go (Japan)': { 
    en: 'Go (Japan)', ar: 'غو (اليابان)', de: 'Go (Japan)',
    es: 'Go (Japón)', fr: 'Go (Japon)', it: 'Go (Giappone)',
    pt: 'Go (Japão)', ru: 'Го (Япония)', zh: '合（日本）', ja: '合', ko: '합 (일본)'
  },
  'Sho (Japan)': { 
    en: 'Shō (Japan)', ar: 'شو (اليابان)', de: 'Shō (Japan)',
    es: 'Shō (Japón)', fr: 'Shō (Japon)', it: 'Shō (Giappone)',
    pt: 'Shō (Japão)', ru: 'Сё (Япония)', zh: '升（日本）', ja: '升', ko: '승 (일본)'
  },
  'To (Japan)': { 
    en: 'To (Japan)', ar: 'تو (اليابان)', de: 'To (Japan)',
    es: 'To (Japón)', fr: 'To (Japon)', it: 'To (Giappone)',
    pt: 'To (Japão)', ru: 'То (Япония)', zh: '斗（日本）', ja: '斗', ko: '두 (일본)'
  },
  'Koku (Japan)': { 
    en: 'Koku (Japan)', ar: 'كوكو (اليابان)', de: 'Koku (Japan)',
    es: 'Koku (Japón)', fr: 'Koku (Japon)', it: 'Koku (Giappone)',
    pt: 'Koku (Japão)', ru: 'Коку (Япония)', zh: '石（日本）', ja: '石', ko: '석 (일본)'
  },
  'Tsubo (Japan)': { 
    en: 'Tsubo (Japan)', ar: 'تسوبو (اليابان)', de: 'Tsubo (Japan)',
    es: 'Tsubo (Japón)', fr: 'Tsubo (Japon)', it: 'Tsubo (Giappone)',
    pt: 'Tsubo (Japão)', ru: 'Цубо (Япония)', zh: '坪（日本）', ja: '坪', ko: '평 (일본)'
  },
  'Tan (Japan)': { 
    en: 'Tan (Japan)', ar: 'تان (اليابان)', de: 'Tan (Japan)',
    es: 'Tan (Japón)', fr: 'Tan (Japon)', it: 'Tan (Giappone)',
    pt: 'Tan (Japão)', ru: 'Тан (Япония)', zh: '反（日本）', ja: '反', ko: '단 (일본)'
  },
  'Chō (Japan)': { 
    en: 'Chō (Japan)', ar: 'تشو (اليابان)', de: 'Chō (Japan)',
    es: 'Chō (Japón)', fr: 'Chō (Japon)', it: 'Chō (Giappone)',
    pt: 'Chō (Japão)', ru: 'Тё (Япония)', zh: '町（日本）', ja: '町', ko: '정 (일본)'
  },
  'Jō/Tatami (Japan)': { 
    en: 'Jō/Tatami (Japan)', ar: 'تاتامي (اليابان)', de: 'Tatami (Japan)',
    es: 'Tatami (Japón)', fr: 'Tatami (Japon)', it: 'Tatami (Giappone)',
    pt: 'Tatami (Japão)', ru: 'Татами (Япония)', zh: '畳（日本）', ja: '畳', ko: '다다미 (일본)'
  },
  'Danchi-ma (Japan)': { 
    en: 'Danchi-ma (Japan)', ar: 'دانتشي-ما (اليابان)', de: 'Danchi-ma (Japan)',
    es: 'Danchi-ma (Japón)', fr: 'Danchi-ma (Japon)', it: 'Danchi-ma (Giappone)',
    pt: 'Danchi-ma (Japão)', ru: 'Данти-ма (Япония)', zh: '团地间（日本）', ja: '団地間', ko: '단치마 (일본)'
  },
  'Edoma/Kantō-ma (Japan)': { 
    en: 'Edoma/Kantō-ma (Japan)', ar: 'إيدوما (اليابان)', de: 'Edoma (Japan)',
    es: 'Edoma (Japón)', fr: 'Edoma (Japon)', it: 'Edoma (Giappone)',
    pt: 'Edoma (Japão)', ru: 'Эдома (Япония)', zh: '江户间（日本）', ja: '江戸間', ko: '에도마 (일본)'
  },
  'Chūkyō-ma (Japan)': { 
    en: 'Chūkyō-ma (Japan)', ar: 'تشوكيو-ما (اليابان)', de: 'Chūkyō-ma (Japan)',
    es: 'Chūkyō-ma (Japón)', fr: 'Chūkyō-ma (Japon)', it: 'Chūkyō-ma (Giappone)',
    pt: 'Chūkyō-ma (Japão)', ru: 'Тюкё-ма (Япония)', zh: '中京间（日本）', ja: '中京間', ko: '추쿄마 (일본)'
  },
  'Kyōma (Japan)': { 
    en: 'Kyōma (Japan)', ar: 'كيوما (اليابان)', de: 'Kyōma (Japan)',
    es: 'Kyōma (Japón)', fr: 'Kyōma (Japon)', it: 'Kyōma (Giappone)',
    pt: 'Kyōma (Japão)', ru: 'Кёма (Япония)', zh: '京间（日本）', ja: '京間', ko: '교마 (일본)'
  },
  'Cun (China)': { 
    en: 'Cun (China)', ar: 'تسون (الصين)', de: 'Cun (China)',
    es: 'Cun (China)', fr: 'Cun (Chine)', it: 'Cun (Cina)',
    pt: 'Cun (China)', ru: 'Цунь (Китай)', zh: '寸', ja: '寸（中国）', ko: '촌 (중국)'
  },
  'Chi (China)': { 
    en: 'Chi (China)', ar: 'تشي (الصين)', de: 'Chi (China)',
    es: 'Chi (China)', fr: 'Chi (Chine)', it: 'Chi (Cina)',
    pt: 'Chi (China)', ru: 'Чи (Китай)', zh: '尺', ja: '尺（中国）', ko: '척 (중국)'
  },
  'Zhang (China)': { 
    en: 'Zhang (China)', ar: 'تشانغ (الصين)', de: 'Zhang (China)',
    es: 'Zhang (China)', fr: 'Zhang (Chine)', it: 'Zhang (Cina)',
    pt: 'Zhang (China)', ru: 'Чжан (Китай)', zh: '丈', ja: '丈（中国）', ko: '장 (중국)'
  },
  'Li (China)': { 
    en: 'Li (China)', ar: 'لي (الصين)', de: 'Li (China)',
    es: 'Li (China)', fr: 'Li (Chine)', it: 'Li (Cina)',
    pt: 'Li (China)', ru: 'Ли (Китай)', zh: '里', ja: '里（中国）', ko: '리 (중국)'
  },
  'Mace (China, PRC)': { 
    en: 'Mace (China, PRC)', ar: 'ميس (الصين)', de: 'Mace (China)',
    es: 'Mace (China)', fr: 'Mace (Chine)', it: 'Mace (Cina)',
    pt: 'Mace (China)', ru: 'Мэйс (Китай)', zh: '钱', ja: '銭（中国）', ko: '전 (중국)'
  },
  'Tael (China, PRC)': { 
    en: 'Tael (China, PRC)', ar: 'تايل (الصين)', de: 'Tael (China)',
    es: 'Tael (China)', fr: 'Tael (Chine)', it: 'Tael (Cina)',
    pt: 'Tael (China)', ru: 'Лян (Китай)', zh: '两', ja: '両（中国）', ko: '냥 (중국)'
  },
  'Jin (China, PRC)': { 
    en: 'Jin (China, PRC)', ar: 'جين (الصين)', de: 'Jin (China)',
    es: 'Jin (China)', fr: 'Jin (Chine)', it: 'Jin (Cina)',
    pt: 'Jin (China)', ru: 'Цзинь (Китай)', zh: '斤', ja: '斤（中国）', ko: '근 (중국)'
  },
  'Dan (China, PRC)': { 
    en: 'Dan (China, PRC)', ar: 'دان (الصين)', de: 'Dan (China)',
    es: 'Dan (China)', fr: 'Dan (Chine)', it: 'Dan (Cina)',
    pt: 'Dan (China)', ru: 'Дань (Китай)', zh: '担', ja: '担（中国）', ko: '담 (중국)'
  },
  'Sheng (China)': { 
    en: 'Sheng (China)', ar: 'شينغ (الصين)', de: 'Sheng (China)',
    es: 'Sheng (China)', fr: 'Sheng (Chine)', it: 'Sheng (Cina)',
    pt: 'Sheng (China)', ru: 'Шэн (Китай)', zh: '升', ja: '升（中国）', ko: '승 (중국)'
  },
  'Dou (China)': { 
    en: 'Dou (China)', ar: 'دو (الصين)', de: 'Dou (China)',
    es: 'Dou (China)', fr: 'Dou (Chine)', it: 'Dou (Cina)',
    pt: 'Dou (China)', ru: 'Доу (Китай)', zh: '斗', ja: '斗（中国）', ko: '두 (중국)'
  },
  'Dan (China volume)': { 
    en: 'Dan (China volume)', ar: 'دان (حجم الصين)', de: 'Dan (China Volumen)',
    es: 'Dan (China volumen)', fr: 'Dan (Chine volume)', it: 'Dan (Cina volume)',
    pt: 'Dan (China volume)', ru: 'Дань (Китай объём)', zh: '石', ja: '石（中国）', ko: '석 (중국)'
  },
  'Mu (China)': { 
    en: 'Mu (China)', ar: 'مو (الصين)', de: 'Mu (China)',
    es: 'Mu (China)', fr: 'Mu (Chine)', it: 'Mu (Cina)',
    pt: 'Mu (China)', ru: 'Му (Китай)', zh: '亩', ja: '畝（中国）', ko: '무 (중국)'
  },
  'Qing (China)': { 
    en: 'Qing (China)', ar: 'تشينغ (الصين)', de: 'Qing (China)',
    es: 'Qing (China)', fr: 'Qing (Chine)', it: 'Qing (Cina)',
    pt: 'Qing (China)', ru: 'Цин (Китай)', zh: '顷', ja: '頃（中国）', ko: '경 (중국)'
  },
  'Ja (Korea)': { 
    en: 'Ja (Korea)', ar: 'جا (كوريا)', de: 'Ja (Korea)',
    es: 'Ja (Corea)', fr: 'Ja (Corée)', it: 'Ja (Corea)',
    pt: 'Ja (Coreia)', ru: 'Чжа (Корея)', zh: '자（韩国）', ja: '尺（韓国）', ko: '자'
  },
  'Ri (Korea)': { 
    en: 'Ri (Korea)', ar: 'ري (كوريا)', de: 'Ri (Korea)',
    es: 'Ri (Corea)', fr: 'Ri (Corée)', it: 'Ri (Corea)',
    pt: 'Ri (Coreia)', ru: 'Ри (Корея)', zh: '리（韩国）', ja: '里（韓国）', ko: '리'
  },
  'Don (Korea)': { 
    en: 'Don (Korea)', ar: 'دون (كوريا)', de: 'Don (Korea)',
    es: 'Don (Corea)', fr: 'Don (Corée)', it: 'Don (Corea)',
    pt: 'Don (Coreia)', ru: 'Дон (Корея)', zh: '돈（韩国）', ja: '銭（韓国）', ko: '돈'
  },
  'Geun (Korea)': { 
    en: 'Geun (Korea)', ar: 'جون (كوريا)', de: 'Geun (Korea)',
    es: 'Geun (Corea)', fr: 'Geun (Corée)', it: 'Geun (Corea)',
    pt: 'Geun (Coreia)', ru: 'Кын (Корея)', zh: '근（韩国）', ja: '斤（韓国）', ko: '근'
  },
  'Hop (Korea)': { 
    en: 'Hop (Korea)', ar: 'هوب (كوريا)', de: 'Hop (Korea)',
    es: 'Hop (Corea)', fr: 'Hop (Corée)', it: 'Hop (Corea)',
    pt: 'Hop (Coreia)', ru: 'Хоп (Корея)', zh: '홉（韩国）', ja: '合（韓国）', ko: '홉'
  },
  'Doe (Korea)': { 
    en: 'Doe (Korea)', ar: 'دو (كوريا)', de: 'Doe (Korea)',
    es: 'Doe (Corea)', fr: 'Doe (Corée)', it: 'Doe (Corea)',
    pt: 'Doe (Coreia)', ru: 'Дой (Корея)', zh: '되（韩国）', ja: '升（韓国）', ko: '되'
  },
  'Mal (Korea)': { 
    en: 'Mal (Korea)', ar: 'مال (كوريا)', de: 'Mal (Korea)',
    es: 'Mal (Corea)', fr: 'Mal (Corée)', it: 'Mal (Corea)',
    pt: 'Mal (Coreia)', ru: 'Маль (Корея)', zh: '말（韩国）', ja: '斗（韓国）', ko: '말'
  },
  'Pyeong (Korea)': { 
    en: 'Pyeong (Korea)', ar: 'بيونغ (كوريا)', de: 'Pyeong (Korea)',
    es: 'Pyeong (Corea)', fr: 'Pyeong (Corée)', it: 'Pyeong (Corea)',
    pt: 'Pyeong (Coreia)', ru: 'Пхён (Корея)', zh: '평（韩国）', ja: '坪（韓国）', ko: '평'
  },
  'Se (Korea)': { 
    en: 'Se (Korea)', ar: 'سي (كوريا)', de: 'Se (Korea)',
    es: 'Se (Corea)', fr: 'Se (Corée)', it: 'Se (Corea)',
    pt: 'Se (Coreia)', ru: 'Се (Корея)', zh: '세（韩国）', ja: '畝（韓国）', ko: '세'
  },
  'Cubit (Common)': { 
    en: 'Cubit (Common)', ar: 'ذراع (عام)', de: 'Ellbogen',
    es: 'Codo', fr: 'Coudée', it: 'Cubito',
    pt: 'Côvado', ru: 'Локоть', zh: '腕尺', ja: 'キュービット', ko: '큐빗'
  },
  'Cubit (Egyptian Royal)': { 
    en: 'Cubit (Egyptian Royal)', ar: 'ذراع ملكي مصري', de: 'Königliche Elle',
    es: 'Codo Real Egipcio', fr: 'Coudée Royale', it: 'Cubito Reale',
    pt: 'Côvado Real', ru: 'Царский Локоть', zh: '皇家腕尺', ja: '王室キュービット', ko: '왕실 큐빗'
  },
  'Fathom': { 
    en: 'Fathom', ar: 'قامة', de: 'Faden',
    es: 'Braza', fr: 'Brasse', it: 'Braccio',
    pt: 'Braça', ru: 'Сажень', zh: '英寻', ja: 'ファゾム', ko: '패덤'
  },
  'Furlong': { 
    en: 'Furlong', ar: 'فرلنغ', de: 'Furlong',
    es: 'Estadio', fr: 'Furlong', it: 'Furlong',
    pt: 'Furlong', ru: 'Фурлонг', zh: '弗隆', ja: 'ハロン', ko: '펄롱'
  },
  'League': { 
    en: 'League', ar: 'فرسخ', de: 'Leuge',
    es: 'Legua', fr: 'Lieue', it: 'Lega',
    pt: 'Légua', ru: 'Лье', zh: '里格', ja: 'リーグ', ko: '리그'
  },
  'Grain': { 
    en: 'Grain', ar: 'حبة', de: 'Korn',
    es: 'Grano', fr: 'Grain', it: 'Grano',
    pt: 'Grão', ru: 'Гран', zh: '格令', ja: 'グレーン', ko: '그레인'
  },
  'Troy Ounce': { 
    en: 'Troy Ounce', ar: 'أونصة تروي', de: 'Feinunze',
    es: 'Onza Troy', fr: 'Once Troy', it: 'Oncia Troy',
    pt: 'Onça Troy', ru: 'Тройская Унция', zh: '金衡盎司', ja: 'トロイオンス', ko: '트로이 온스'
  },
  'Carat (Metric)': { 
    en: 'Carat (Metric)', ar: 'قيراط متري', de: 'Karat',
    es: 'Quilate', fr: 'Carat', it: 'Carato',
    pt: 'Quilate', ru: 'Карат', zh: '克拉', ja: 'カラット', ko: '캐럿'
  },
  'Stone (UK)': { 
    en: 'Stone (UK)', ar: 'ستون', de: 'Stone',
    es: 'Stone', fr: 'Stone', it: 'Stone',
    pt: 'Stone', ru: 'Стоун', zh: '英石', ja: 'ストーン', ko: '스톤'
  },
  'Bushel (US)': { 
    en: 'Bushel (US)', ar: 'بوشل', de: 'Scheffel',
    es: 'Bushel', fr: 'Boisseau', it: 'Bushel',
    pt: 'Bushel', ru: 'Бушель', zh: '蒲式耳', ja: 'ブッシェル', ko: '부셸'
  },
  'Peck (US)': { 
    en: 'Peck (US)', ar: 'بيك', de: 'Peck',
    es: 'Peck', fr: 'Peck', it: 'Peck',
    pt: 'Peck', ru: 'Пек', zh: '配克', ja: 'ペック', ko: '펙'
  },
  'Acre': { 
    en: 'Acre', ar: 'فدان', de: 'Morgen',
    es: 'Acre', fr: 'Acre', it: 'Acro',
    pt: 'Acre', ru: 'Акр', zh: '英亩', ja: 'エーカー', ko: '에이커'
  },
  'Erg (CGS)': { 
    en: 'Erg (CGS)', ar: 'إرغ', de: 'Erg',
    es: 'Ergio', fr: 'Erg', it: 'Erg',
    pt: 'Erg', ru: 'Эрг', zh: '尔格', ja: 'エルグ', ko: '에르그'
  },
  'Dyne': { 
    en: 'Dyne', ar: 'داين', de: 'Dyn',
    es: 'Dina', fr: 'Dyne', it: 'Dina',
    pt: 'Dina', ru: 'Дина', zh: '达因', ja: 'ダイン', ko: '다인'
  },
  'Poise': { 
    en: 'Poise', ar: 'بواز', de: 'Poise',
    es: 'Poise', fr: 'Poise', it: 'Poise',
    pt: 'Poise', ru: 'Пуаз', zh: '泊', ja: 'ポアズ', ko: '푸아즈'
  },
  'Stokes': { 
    en: 'Stokes', ar: 'ستوكس', de: 'Stokes',
    es: 'Stokes', fr: 'Stokes', it: 'Stokes',
    pt: 'Stokes', ru: 'Стокс', zh: '斯托克斯', ja: 'ストークス', ko: '스토크스'
  },
  'Gauss': { 
    en: 'Gauss', ar: 'غاوس', de: 'Gauß',
    es: 'Gauss', fr: 'Gauss', it: 'Gauss',
    pt: 'Gauss', ru: 'Гаусс', zh: '高斯', ja: 'ガウス', ko: '가우스'
  },
  'Maxwell': { 
    en: 'Maxwell', ar: 'ماكسويل', de: 'Maxwell',
    es: 'Maxwell', fr: 'Maxwell', it: 'Maxwell',
    pt: 'Maxwell', ru: 'Максвелл', zh: '麦克斯韦', ja: 'マクスウェル', ko: '맥스웰'
  },
  'Oersted': { 
    en: 'Oersted', ar: 'أورستد', de: 'Oersted',
    es: 'Oersted', fr: 'Œrsted', it: 'Oersted',
    pt: 'Oersted', ru: 'Эрстед', zh: '奥斯特', ja: 'エルステッド', ko: '외르스테드'
  },
  'Point (Desktop)': { 
    en: 'Point (Desktop)', ar: 'نقطة', de: 'Punkt',
    es: 'Punto', fr: 'Point', it: 'Punto',
    pt: 'Ponto', ru: 'Пункт', zh: '点', ja: 'ポイント', ko: '포인트'
  },
  'Pica': { 
    en: 'Pica', ar: 'بيكا', de: 'Pica',
    es: 'Pica', fr: 'Pica', it: 'Pica',
    pt: 'Pica', ru: 'Пика', zh: '派卡', ja: 'パイカ', ko: '파이카'
  },
  'Pixel (96 PPI)': { 
    en: 'Pixel (96 PPI)', ar: 'بكسل', de: 'Pixel',
    es: 'Píxel', fr: 'Pixel', it: 'Pixel',
    pt: 'Pixel', ru: 'Пиксель', zh: '像素', ja: 'ピクセル', ko: '픽셀'
  },
  'Em (16px ref)': { 
    en: 'Em (16px ref)', ar: 'إيم', de: 'Geviert',
    es: 'Em', fr: 'Em', it: 'Em',
    pt: 'Em', ru: 'Эм', zh: 'em', ja: 'em', ko: 'em'
  },
  'Drop': { 
    en: 'Drop', ar: 'قطرة', de: 'Tropfen',
    es: 'Gota', fr: 'Goutte', it: 'Goccia',
    pt: 'Gota', ru: 'Капля', zh: '滴', ja: '滴', ko: '방울'
  },
  'Pinch': { 
    en: 'Pinch', ar: 'قرصة', de: 'Prise',
    es: 'Pizca', fr: 'Pincée', it: 'Pizzico',
    pt: 'Pitada', ru: 'Щепотка', zh: '撮', ja: 'ひとつまみ', ko: '꼬집'
  },
  'Dash': { 
    en: 'Dash', ar: 'رشة', de: 'Spritzer',
    es: 'Chorrito', fr: 'Trait', it: 'Pizzico',
    pt: 'Pitada', ru: 'Чуточка', zh: '少许', ja: 'ひとふり', ko: '조금'
  },
  'Dessertspoon': { 
    en: 'Dessertspoon', ar: 'ملعقة حلوى', de: 'Dessertlöffel',
    es: 'Cuchara de Postre', fr: 'Cuillère à Dessert', it: 'Cucchiaio da Dessert',
    pt: 'Colher de Sobremesa', ru: 'Десертная Ложка', zh: '甜品匙', ja: 'デザートスプーン', ko: '디저트 스푼'
  },
  'Cube Root': { 
    en: 'Cube Root', ar: 'الجذر التكعيبي', de: 'Kubikwurzel',
    es: 'Raíz Cúbica', fr: 'Racine Cubique', it: 'Radice Cubica',
    pt: 'Raiz Cúbica', ru: 'Кубический Корень', zh: '立方根', ja: '立方根', ko: '세제곱근'
  },
  'Fourth Root': { 
    en: 'Fourth Root', ar: 'الجذر الرابع', de: 'Vierte Wurzel',
    es: 'Raíz Cuarta', fr: 'Racine Quatrième', it: 'Radice Quarta',
    pt: 'Raiz Quarta', ru: 'Корень Четвёртой Степени', zh: '四次方根', ja: '四乗根', ko: '네제곱근'
  },
  'Hyperbolic Sine': { 
    en: 'Hyperbolic Sine', ar: 'الجيب الزائدي', de: 'Hyperbelsinus',
    es: 'Seno Hiperbólico', fr: 'Sinus Hyperbolique', it: 'Seno Iperbolico',
    pt: 'Seno Hiperbólico', ru: 'Гиперболический Синус', zh: '双曲正弦', ja: '双曲線正弦', ko: '쌍곡 사인'
  },
  'Hyperbolic Cosine': { 
    en: 'Hyperbolic Cosine', ar: 'جيب التمام الزائدي', de: 'Hyperbelkosinus',
    es: 'Coseno Hiperbólico', fr: 'Cosinus Hyperbolique', it: 'Coseno Iperbolico',
    pt: 'Cosseno Hiperbólico', ru: 'Гиперболический Косинус', zh: '双曲余弦', ja: '双曲線余弦', ko: '쌍곡 코사인'
  },
  'Hyperbolic Tangent': { 
    en: 'Hyperbolic Tangent', ar: 'الظل الزائدي', de: 'Hyperbeltangens',
    es: 'Tangente Hiperbólica', fr: 'Tangente Hyperbolique', it: 'Tangente Iperbolica',
    pt: 'Tangente Hiperbólica', ru: 'Гиперболический Тангенс', zh: '双曲正切', ja: '双曲線正接', ko: '쌍곡 탄젠트'
  },
  'Inverse Hyperbolic Sine': { 
    en: 'Inverse Hyperbolic Sine', ar: 'معكوس الجيب الزائدي', de: 'Areahyperbelsinus',
    es: 'Arcoseno Hiperbólico', fr: 'Argument Sinus Hyperbolique', it: 'Arcoseno Iperbolico',
    pt: 'Arcosseno Hiperbólico', ru: 'Обратный Гиперболический Синус', zh: '反双曲正弦', ja: '逆双曲線正弦', ko: '역쌍곡 사인'
  },
  'Inverse Hyperbolic Cosine': { 
    en: 'Inverse Hyperbolic Cosine', ar: 'معكوس جيب التمام الزائدي', de: 'Areahyperbelkosinus',
    es: 'Arcocoseno Hiperbólico', fr: 'Argument Cosinus Hyperbolique', it: 'Arcocoseno Iperbolico',
    pt: 'Arcocosseno Hiperbólico', ru: 'Обратный Гиперболический Косинус', zh: '反双曲余弦', ja: '逆双曲線余弦', ko: '역쌍곡 코사인'
  },
  'Inverse Hyperbolic Tangent': { 
    en: 'Inverse Hyperbolic Tangent', ar: 'معكوس الظل الزائدي', de: 'Areahyperbeltangens',
    es: 'Arcotangente Hiperbólica', fr: 'Argument Tangente Hyperbolique', it: 'Arcotangente Iperbolica',
    pt: 'Arcotangente Hiperbólica', ru: 'Обратный Гиперболический Тангенс', zh: '反双曲正切', ja: '逆双曲線正接', ko: '역쌍곡 탄젠트'
  },
  'Log Base 2': { 
    en: 'Log Base 2', ar: 'اللوغاريتم للأساس 2', de: 'Logarithmus Basis 2',
    es: 'Logaritmo Base 2', fr: 'Logarithme Base 2', it: 'Logaritmo Base 2',
    pt: 'Logaritmo Base 2', ru: 'Логарифм по Основанию 2', zh: '以2为底的对数', ja: '底2の対数', ko: '밑이 2인 로그'
  },
  'Sign': { 
    en: 'Sign', ar: 'الإشارة', de: 'Vorzeichen',
    es: 'Signo', fr: 'Signe', it: 'Segno',
    pt: 'Sinal', ru: 'Знак', zh: '符号', ja: '符号', ko: '부호'
  },
  'Floor': { 
    en: 'Floor', ar: 'دالة الأرضية', de: 'Abrunden',
    es: 'Piso', fr: 'Partie Entière Inférieure', it: 'Arrotondamento per Difetto',
    pt: 'Piso', ru: 'Округление Вниз', zh: '向下取整', ja: '床関数', ko: '내림'
  },
  'Ceiling': { 
    en: 'Ceiling', ar: 'دالة السقف', de: 'Aufrunden',
    es: 'Techo', fr: 'Partie Entière Supérieure', it: 'Arrotondamento per Eccesso',
    pt: 'Teto', ru: 'Округление Вверх', zh: '向上取整', ja: '天井関数', ko: '올림'
  },
  'Round': { 
    en: 'Round', ar: 'تقريب', de: 'Runden',
    es: 'Redondear', fr: 'Arrondir', it: 'Arrotondare',
    pt: 'Arredondar', ru: 'Округление', zh: '四舍五入', ja: '四捨五入', ko: '반올림'
  },
  'Truncate': { 
    en: 'Truncate', ar: 'اقتطاع', de: 'Abschneiden',
    es: 'Truncar', fr: 'Tronquer', it: 'Troncare',
    pt: 'Truncar', ru: 'Отсечение', zh: '截断', ja: '切り捨て', ko: '버림'
  },
  'Square': { 
    en: 'Square', ar: 'مربع', de: 'Quadrat',
    es: 'Cuadrado', fr: 'Carré', it: 'Quadrato',
    pt: 'Quadrado', ru: 'Квадрат', zh: '平方', ja: '二乗', ko: '제곱'
  },
  'Cube': { 
    en: 'Cube', ar: 'مكعب', de: 'Kubik',
    es: 'Cubo', fr: 'Cube', it: 'Cubo',
    pt: 'Cubo', ru: 'Куб', zh: '立方', ja: '三乗', ko: '세제곱'
  },
  'Fourth Power': { 
    en: 'Fourth Power', ar: 'القوة الرابعة', de: 'Vierte Potenz',
    es: 'Cuarta Potencia', fr: 'Puissance Quatrième', it: 'Quarta Potenza',
    pt: 'Quarta Potência', ru: 'Четвёртая Степень', zh: '四次方', ja: '四乗', ko: '네제곱'
  },
  'Number': { 
    en: 'Number', ar: 'رقم', de: 'Zahl',
    es: 'Número', fr: 'Nombre', it: 'Numero',
    pt: 'Número', ru: 'Число', zh: '数字', ja: '数', ko: '숫자'
  },
  'Pi (π)': { 
    en: 'Pi (π)', ar: 'باي (π)', de: 'Pi (π)',
    es: 'Pi (π)', fr: 'Pi (π)', it: 'Pi greco (π)',
    pt: 'Pi (π)', ru: 'Пи (π)', zh: '圆周率 (π)', ja: '円周率 (π)', ko: '파이 (π)'
  },
  "Euler's Number (ℯ)": { 
    en: "Euler's Number (ℯ)", ar: 'عدد أويلر (ℯ)', de: 'Eulersche Zahl (ℯ)',
    es: 'Número de Euler (ℯ)', fr: "Nombre d'Euler (ℯ)", it: 'Numero di Eulero (ℯ)',
    pt: 'Número de Euler (ℯ)', ru: 'Число Эйлера (ℯ)', zh: '欧拉数 (ℯ)', ja: 'オイラー数 (ℯ)', ko: '오일러 수 (ℯ)'
  },
  'Square Root of 2': { 
    en: 'Square Root of 2', ar: 'الجذر التربيعي لـ 2', de: 'Quadratwurzel von 2',
    es: 'Raíz Cuadrada de 2', fr: 'Racine Carrée de 2', it: 'Radice Quadrata di 2',
    pt: 'Raiz Quadrada de 2', ru: 'Квадратный Корень из 2', zh: '2的平方根', ja: '2の平方根', ko: '2의 제곱근'
  },
  'Sine': { 
    en: 'Sine', ar: 'جيب', de: 'Sinus',
    es: 'Seno', fr: 'Sinus', it: 'Seno',
    pt: 'Seno', ru: 'Синус', zh: '正弦', ja: '正弦', ko: '사인'
  },
  'Cosine': { 
    en: 'Cosine', ar: 'جيب التمام', de: 'Kosinus',
    es: 'Coseno', fr: 'Cosinus', it: 'Coseno',
    pt: 'Cosseno', ru: 'Косинус', zh: '余弦', ja: '余弦', ko: '코사인'
  },
  'Tangent': { 
    en: 'Tangent', ar: 'ظل', de: 'Tangens',
    es: 'Tangente', fr: 'Tangente', it: 'Tangente',
    pt: 'Tangente', ru: 'Тангенс', zh: '正切', ja: '正接', ko: '탄젠트'
  },
  'Arc Sine': { 
    en: 'Arc Sine', ar: 'قوس الجيب', de: 'Arkussinus',
    es: 'Arcoseno', fr: 'Arc Sinus', it: 'Arcoseno',
    pt: 'Arcosseno', ru: 'Арксинус', zh: '反正弦', ja: '逆正弦', ko: '아크사인'
  },
  'Arc Cosine': { 
    en: 'Arc Cosine', ar: 'قوس جيب التمام', de: 'Arkuskosinus',
    es: 'Arcocoseno', fr: 'Arc Cosinus', it: 'Arcocoseno',
    pt: 'Arcocosseno', ru: 'Арккосинус', zh: '反余弦', ja: '逆余弦', ko: '아크코사인'
  },
  'Arc Tangent': { 
    en: 'Arc Tangent', ar: 'قوس الظل', de: 'Arkustangens',
    es: 'Arcotangente', fr: 'Arc Tangente', it: 'Arcotangente',
    pt: 'Arcotangente', ru: 'Арктангенс', zh: '反正切', ja: '逆正接', ko: '아크탄젠트'
  },
  'Square Root': { 
    en: 'Square Root', ar: 'الجذر التربيعي', de: 'Quadratwurzel',
    es: 'Raíz Cuadrada', fr: 'Racine Carrée', it: 'Radice Quadrata',
    pt: 'Raiz Quadrada', ru: 'Квадратный Корень', zh: '平方根', ja: '平方根', ko: '제곱근'
  },
  'Log Base 10': { 
    en: 'Log Base 10', ar: 'اللوغاريتم للأساس 10', de: 'Logarithmus Basis 10',
    es: 'Logaritmo Base 10', fr: 'Logarithme Base 10', it: 'Logaritmo Base 10',
    pt: 'Logaritmo Base 10', ru: 'Логарифм по Основанию 10', zh: '常用对数', ja: '常用対数', ko: '상용로그'
  },
  'Natural Log': { 
    en: 'Natural Log', ar: 'اللوغاريتم الطبيعي', de: 'Natürlicher Logarithmus',
    es: 'Logaritmo Natural', fr: 'Logarithme Naturel', it: 'Logaritmo Naturale',
    pt: 'Logaritmo Natural', ru: 'Натуральный Логарифм', zh: '自然对数', ja: '自然対数', ko: '자연로그'
  },
  'Exponential (eˣ)': { 
    en: 'Exponential (eˣ)', ar: 'الدالة الأسية (eˣ)', de: 'Exponentialfunktion (eˣ)',
    es: 'Exponencial (eˣ)', fr: 'Exponentielle (eˣ)', it: 'Esponenziale (eˣ)',
    pt: 'Exponencial (eˣ)', ru: 'Экспонента (eˣ)', zh: '指数函数 (eˣ)', ja: '指数関数 (eˣ)', ko: '지수함수 (eˣ)'
  },
  'Absolute Value': { 
    en: 'Absolute Value', ar: 'القيمة المطلقة', de: 'Absolutwert',
    es: 'Valor Absoluto', fr: 'Valeur Absolue', it: 'Valore Assoluto',
    pt: 'Valor Absoluto', ru: 'Абсолютное Значение', zh: '绝对值', ja: '絶対値', ko: '절댓값'
  },
};

export const SI_SYMBOLS = [
  'm', 'kg', 'g', 's', 'A', 'K', 'mol', 'cd',
  'Hz', 'N', 'Pa', 'J', 'W', 'C', 'V', 'F',
  'Ω', 'S', 'Wb', 'T', 'H', 'lm', 'lx', 'Bq',
  'Gy', 'Sv', 'kat', 'rad', 'sr',
  'm²', 'm³', 'L', 'ha',
];

export const SI_PREFIX_SYMBOLS = [
  'Y', 'Z', 'E', 'P', 'T', 'G', 'M', 'k',
  'c', 'm', 'µ', 'n', 'p', 'f', 'a', 'z', 'y',
];

export const translate = (
  key: string, 
  language: SupportedLanguage, 
  translations: Record<string, Translation>
): string => {
  if (!translations[key]) {
    return key;
  }
  
  const trans = translations[key];
  
  if (language === 'en' || language === 'en-us') return trans.en;
  
  const langKey = language as keyof Translation;
  if (trans[langKey]) return trans[langKey] as string;
  
  return trans.en || key;
};

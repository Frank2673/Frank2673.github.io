<!-- 继续前面的HTML代码 -->

<script>
// 等待DOM完全加载
document.addEventListener('DOMContentLoaded', function() {
    // 初始化机甲博客系统
    initMechBlogSystem();
});

// 机甲博客系统初始化
function initMechBlogSystem() {
    // 隐藏加载动画
    setTimeout(() => {
        document.getElementById('mech-loader').classList.add('hidden');
    }, 1500);
    
    // 初始化页面切换
    initPageNavigation();
    
    // 初始化鼠标跟随效果
    initMechCursor();
    
    // 初始化宇宙背景效果
    initUniverseBackground();
    
    // 初始化数据库功能
    initDatabase();
    
    // 初始化数据加载
    loadInitialData();
    
    // 初始化滚动动画
    initScrollAnimations();
    
    // 初始化能量粒子流
    initEnergyStream();
    
    // 添加机甲能量脉冲效果
    initEnergyPulses();
    
    // 添加星空粒子效果
    initStarParticles();
}

// 页面导航切换
function initPageNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 移除所有页面的active类
            pages.forEach(page => {
                page.classList.remove('active');
            });
            
            // 移除所有导航链接的active类
            navLinks.forEach(link => {
                link.classList.remove('active');
            });
            
            // 获取目标页面ID
            const targetPage = this.getAttribute('data-page');
            
            // 添加active类到目标页面和当前链接
            document.getElementById(`${targetPage}-page`).classList.add('active');
            this.classList.add('active');
            
            // 如果目标页面是壁纸页面，重新初始化壁纸网格布局
            if (targetPage === 'wallpapers') {
                setTimeout(() => {
                    initWallpapersGrid();
                }, 100);
            }
            
            // 如果目标页面是数据库页面，更新数据库统计
            if (targetPage === 'database') {
                updateDatabaseStats();
            }
            
            // 添加页面切换动画效果
            addPageTransitionEffect();
        });
    });
}

// 机甲鼠标跟随效果
function initMechCursor() {
    const cursor = document.getElementById('mech-cursor');
    const cursorDot = document.getElementById('mech-cursor-dot');
    const cursorTrail = document.getElementById('mech-cursor-trail');
    
    let mouseX = 0;
    let mouseY = 0;
    let trailX = 0;
    let trailY = 0;
    let trailOpacity = 0;
    
    // 鼠标移动监听
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // 显示轨迹效果
        trailOpacity = 0.7;
        setTimeout(() => {
            trailOpacity = 0;
        }, 300);
    });
    
    // 鼠标悬停交互效果
    const interactiveElements = document.querySelectorAll('a, button, .post-card, .recent-post, .character, .database-btn, .filter-btn, .table-action-btn, .tag, .edit-mode-btn');
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', function() {
            cursor.style.width = '40px';
            cursor.style.height = '40px';
            cursor.style.borderColor = 'var(--accent)';
            cursor.style.boxShadow = '0 0 20px var(--accent), inset 0 0 15px var(--accent)';
        });
        
        el.addEventListener('mouseleave', function() {
            cursor.style.width = '24px';
            cursor.style.height = '24px';
            cursor.style.borderColor = 'var(--energy-blue)';
            cursor.style.boxShadow = '0 0 15px var(--energy-blue), inset 0 0 10px var(--energy-blue)';
        });
    });
    
    // 鼠标点击效果
    document.addEventListener('mousedown', function() {
        cursor.style.transform = 'scale(0.8)';
        cursorDot.style.transform = 'scale(1.5)';
    });
    
    document.addEventListener('mouseup', function() {
        cursor.style.transform = 'scale(1)';
        cursorDot.style.transform = 'scale(1)';
    });
    
    // 动画循环更新光标位置
    function animateCursor() {
        // 主光标（延迟跟随）
        let cursorX = cursor.offsetLeft;
        let cursorY = cursor.offsetTop;
        
        cursorX += (mouseX - cursorX - 12) * 0.15;
        cursorY += (mouseY - cursorY - 12) * 0.15;
        
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        
        // 光标点（即时跟随）
        cursorDot.style.left = (mouseX - 4) + 'px';
        cursorDot.style.top = (mouseY - 4) + 'px';
        
        // 光标轨迹（延迟更大）
        trailX += (mouseX - trailX - 20) * 0.05;
        trailY += (mouseY - trailY - 20) * 0.05;
        
        cursorTrail.style.left = trailX + 'px';
        cursorTrail.style.top = trailY + 'px';
        cursorTrail.style.opacity = trailOpacity;
        
        requestAnimationFrame(animateCursor);
    }
    
    // 开始光标动画
    animateCursor();
}

// 宇宙背景效果
function initUniverseBackground() {
    const universeBg = document.getElementById('universe-bg');
    
    // 创建星星
    for (let i = 0; i < 200; i++) {
        const star = document.createElement('div');
        star.classList.add('star-particle');
        
        // 随机大小
        const size = Math.random() * 3;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        // 随机位置
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // 随机闪烁动画
        const duration = 3 + Math.random() * 7;
        const delay = Math.random() * 5;
        star.style.animation = `star-twinkle ${duration}s infinite ${delay}s`;
        
        // 添加到背景
        universeBg.appendChild(star);
    }
    
    // 添加动态星轨
    for (let i = 0; i < 10; i++) {
        const star = document.createElement('div');
        star.classList.add('star-particle');
        star.style.width = '2px';
        star.style.height = '2px';
        star.style.boxShadow = '0 0 8px var(--energy-blue)';
        star.style.background = 'var(--energy-blue)';
        
        // 随机位置
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        // 移动动画
        const duration = 20 + Math.random() * 30;
        const xMove = Math.random() * 100 - 50;
        const yMove = Math.random() * 100 - 50;
        
        star.style.animation = `star-move ${duration}s linear infinite`;
        star.style.animationDelay = Math.random() * 5 + 's';
        
        // 添加到背景
        universeBg.appendChild(star);
    }
}

// 能量粒子流效果
function initEnergyStream() {
    const canvas = document.getElementById('energy-stream');
    const ctx = canvas.getContext('2d');
    
    // 设置canvas尺寸
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // 粒子数组
    let particles = [];
    
    // 粒子类
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 3 + 1;
            this.speedX = Math.random() * 2 - 1;
            this.speedY = Math.random() * 2 - 1;
            this.color = Math.random() > 0.5 ? 'rgba(0, 212, 255, 0.7)' : 'rgba(157, 78, 221, 0.7)';
            this.life = 100;
        }
        
        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            
            // 边界检查
            if (this.x > canvas.width) this.x = 0;
            if (this.x < 0) this.x = canvas.width;
            if (this.y > canvas.height) this.y = 0;
            if (this.y < 0) this.y = canvas.height;
            
            this.life--;
        }
        
        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            
            // 添加光晕效果
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = this.color.replace('0.7', '0.3');
            ctx.fill();
        }
    }
    
    // 初始化粒子
    function initParticles() {
        particles = [];
        for (let i = 0; i < 80; i++) {
            particles.push(new Particle());
        }
    }
    
    // 动画循环
    function animateParticles() {
        // 半透明黑色背景覆盖，创建拖尾效果
        ctx.fillStyle = 'rgba(5, 8, 17, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 更新和绘制每个粒子
        particles.forEach(particle => {
            particle.update();
            particle.draw();
            
            // 如果粒子生命周期结束，重新初始化
            if (particle.life <= 0) {
                const index = particles.indexOf(particle);
                particles[index] = new Particle();
            }
        });
        
        requestAnimationFrame(animateParticles);
    }
    
    // 窗口调整大小时重置canvas
    window.addEventListener('resize', function() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    });
    
    // 启动粒子系统
    initParticles();
    animateParticles();
}

// 机甲能量脉冲效果
function initEnergyPulses() {
    setInterval(() => {
        createEnergyPulse();
    }, 4000);
}

function createEnergyPulse() {
    const pulse = document.createElement('div');
    pulse.classList.add('energy-pulse');
    
    // 随机位置
    pulse.style.left = Math.random() * 100 + '%';
    pulse.style.top = Math.random() * 100 + '%';
    
    // 随机大小
    const size = 50 + Math.random() * 150;
    pulse.style.width = size + 'px';
    pulse.style.height = size + 'px';
    
    // 随机颜色
    const colors = ['var(--energy-blue)', 'var(--energy-purple)', 'var(--accent)'];
    pulse.style.background = `radial-gradient(circle, ${colors[Math.floor(Math.random() * colors.length)]} 0%, transparent 70%)`;
    
    document.body.appendChild(pulse);
    
    // 动画结束后移除元素
    setTimeout(() => {
        pulse.remove();
    }, 4000);
}

// 星空粒子效果
function initStarParticles() {
    setInterval(() => {
        createStarParticle();
    }, 300);
}

function createStarParticle() {
    const star = document.createElement('div');
    star.classList.add('star-particle');
    
    // 随机大小
    const size = Math.random() * 2;
    star.style.width = size + 'px';
    star.style.height = size + 'px';
    
    // 随机位置（从顶部开始）
    star.style.left = Math.random() * 100 + '%';
    star.style.top = '0%';
    
    // 随机颜色
    const colors = ['#ffffff', '#00d4ff', '#9d4edd', '#ff0080'];
    star.style.background = colors[Math.floor(Math.random() * colors.length)];
    star.style.boxShadow = `0 0 8px ${star.style.background}`;
    
    document.getElementById('universe-bg').appendChild(star);
    
    // 下落动画
    const duration = 2 + Math.random() * 5;
    star.style.transition = `all ${duration}s linear`;
    star.style.transform = `translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg)`;
    
    // 动画结束后移除元素
    setTimeout(() => {
        star.remove();
    }, duration * 1000);
}

// 页面切换动画效果
function addPageTransitionEffect() {
    // 创建能量脉冲效果
    const pulses = document.querySelectorAll('.energy-pulse');
    pulses.forEach(pulse => pulse.remove());
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createEnergyPulse();
        }, i * 200);
    }
}

// 滚动动画初始化
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    // 检查元素是否在视口中
    function checkScroll() {
        animatedElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const isVisible = (rect.top <= window.innerHeight * 0.85);
            
            if (isVisible) {
                el.classList.add('visible');
            }
        });
    }
    
    // 初始检查
    checkScroll();
    
    // 滚动时检查
    window.addEventListener('scroll', checkScroll);
}

// 初始数据加载
function loadInitialData() {
    // 加载特色文章
    loadFeaturedPosts();
    
    // 加载所有文章
    loadAllPosts();
    
    // 加载角色数据
    loadCharacters();
    
    // 加载壁纸数据
    loadWallpapers();
    
    // 加载侧边栏数据
    loadSidebarData();
    
    // 加载标签数据
    loadTags();
}

// 模拟机甲文章数据
const mechArticles = [
    {
        id: 1,
        title: "罗峰机甲觉醒！宇宙海新纪元开启",
        excerpt: "在第102集中，罗峰的机甲终于完全觉醒，突破宇宙级九阶，正式踏入宇宙海。本日志详细解析机甲觉醒的每一个关键瞬间，以及宇宙海中的新威胁和机遇。",
        category: "机甲战斗解析",
        date: "2023-12-20",
        readTime: "8分钟",
        tags: ["罗峰", "机甲觉醒", "宇宙海", "第102集"],
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 2,
        title: "金角巨兽机甲进化路径深度解析",
        excerpt: "作为罗峰最重要的机甲形态之一，金角巨兽机甲拥有独特的进化路径。本文从基因层面解析金角巨兽机甲的进化逻辑，以及未来可能的发展方向。",
        category: "机甲角色分析",
        date: "2023-12-18",
        readTime: "12分钟",
        tags: ["金角巨兽", "机甲进化", "基因解析", "罗峰"],
        image: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 3,
        title: "宇宙海机甲战场地形分析",
        excerpt: "宇宙海作为《吞噬星空》机甲宇宙的新地图，拥有复杂的地形和特殊环境。本文详细分析宇宙海中的各个机甲战场地形，以及如何在其中获得战术优势。",
        category: "机甲宇宙观",
        date: "2023-12-15",
        readTime: "10分钟",
        tags: ["宇宙海", "机甲战场", "地形分析", "战术"],
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 4,
        title: "从学徒级到宇宙级：机甲升级体系全解",
        excerpt: "《吞噬星空》机甲宇宙拥有完整而严谨的升级体系。本文系统解析从学徒级机甲到宇宙级机甲的每一个阶段，以及每个阶段的关键突破点。",
        category: "机甲升级体系",
        date: "2023-12-12",
        readTime: "15分钟",
        tags: ["机甲升级", "体系解析", "宇宙级", "突破"],
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 5,
        title: "陨墨星传承机甲技术解密",
        excerpt: "陨墨星传承是罗峰机甲成长的关键。本文深入解析陨墨星传承中的机甲技术，包括灵魂防御机甲、念力兵器机甲等尖端技术。",
        category: "机甲战斗解析",
        date: "2023-12-10",
        readTime: "14分钟",
        tags: ["陨墨星", "传承机甲", "灵魂防御", "念力兵器"],
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    },
    {
        id: 6,
        title: "巴巴塔智能机甲系统分析",
        excerpt: "巴巴塔作为陨墨星传承的智能机甲系统，在罗峰的机甲成长中扮演了重要角色。本文解析巴巴塔系统的功能、限制以及未来升级可能。",
        category: "机甲角色分析",
        date: "2023-12-08",
        readTime: "9分钟",
        tags: ["巴巴塔", "智能机甲", "系统分析", "人工智能"],
        image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
    }
];

// 模拟机甲角色数据
const mechCharacters = [
    {
        id: 1,
        name: "罗峰",
        title: "地球机甲驾驶员",
        description: "陨墨星机甲传承者，金角巨兽机甲宿主。从地球普通机甲学员成长为宇宙级九阶机甲驾驶员。",
        image: "https://images.unsplash.com/photo-1633332755192-727a05c4013d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
        status: "宇宙级九阶机甲",
        tags: ["主角", "地球", "金角巨兽", "陨墨星传承"]
    },
    {
        id: 2,
        name: "洪",
        title: "地球第一机甲驾驶员",
        description: "地球三大机甲驾驶员之首，拥有领域机甲能力，是罗峰早期的机甲导师之一。",
        image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w-400&q=80",
        status: "行星级九阶机甲",
        tags: ["地球三巨头", "领域机甲", "导师"]
    },
    {
        id: 3,
        name: "雷神",
        title: "地球第二机甲驾驶员",
        description: "地球三大机甲驾驶员之一，雷电属性机甲专家，机甲速度极快。",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
        status: "行星级八阶机甲",
        tags: ["地球三巨头", "雷电机甲", "速度型"]
    },
    {
        id: 4,
        name: "巴巴塔",
        title: "陨墨星智能机甲系统",
        description: "陨墨星传承的智能机甲系统，拥有庞大的机甲数据库和丰富的机甲战斗经验。",
        image: "https://images.unsplash.com/photo-1580477667995-2b94f01c9516?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
        status: "智能机甲系统",
        tags: ["人工智能", "导师", "陨墨星"]
    },
    {
        id: 5,
        name: "徐欣",
        title: "罗峰的机甲伴侣",
        description: "罗峰的妻子，虽然不是机甲驾驶员，但在罗峰的机甲成长道路上给予了重要的精神支持。",
        image: "https://images.unsplash.com/photo-1494790108755-2616b786d4d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
        status: "非战斗人员",
        tags: ["伴侣", "支持者", "地球"]
    },
    {
        id: 6,
        name: "呼延博",
        title: "陨墨星机甲创始人",
        description: "陨墨星机甲的创始人，不朽级机甲驾驶员，其传承改变了罗峰的机甲命运。",
        image: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80",
        status: "不朽级机甲(已故)",
        tags: ["创始人", "不朽级", "陨墨星"]
    }
];

// 模拟机甲壁纸数据
const mechWallpapers = [
    {
        id: 1,
        name: "罗峰机甲觉醒",
        category: "角色",
        tags: ["罗峰", "机甲觉醒", "宇宙海"],
        resolution: "3840x2160",
        size: "8.2MB",
        downloads: 1245,
        date: "2023-12-20",
        image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 2,
        name: "金角巨兽机甲",
        category: "角色",
        tags: ["金角巨兽", "罗峰", "机甲形态"],
        resolution: "3840x2160",
        size: "9.1MB",
        downloads: 987,
        date: "2023-12-18",
        image: "https://images.unsplash.com/photo-1591696205602-2f950c417cb9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 3,
        name: "宇宙海星图",
        category: "宇宙",
        tags: ["宇宙海", "星图", "机甲战场"],
        resolution: "5120x2880",
        size: "12.5MB",
        downloads: 765,
        date: "2023-12-15",
        image: "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 4,
        name: "机甲升级路径图",
        category: "概念",
        tags: ["机甲升级", "体系", "概念图"],
        resolution: "3840x2160",
        size: "7.8MB",
        downloads: 543,
        date: "2023-12-12",
        image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 5,
        name: "陨墨星传承",
        category: "场景",
        tags: ["陨墨星", "传承", "机甲技术"],
        resolution: "3840x2160",
        size: "8.9MB",
        downloads: 432,
        date: "2023-12-10",
        image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 6,
        name: "机甲战斗场景",
        category: "战斗",
        tags: ["机甲战斗", "战场", "第102集"],
        resolution: "5120x2880",
        size: "11.3MB",
        downloads: 876,
        date: "2023-12-08",
        image: "https://images.unsplash.com/photo-1571171637578-41bc2dd41cd2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 7,
        name: "巴巴塔智能界面",
        category: "概念",
        tags: ["巴巴塔", "智能机甲", "界面"],
        resolution: "3840x2160",
        size: "6.7MB",
        downloads: 321,
        date: "2023-12-05",
        image: "https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 8,
        name: "地球机甲基地",
        category: "场景",
        tags: ["地球", "机甲基地", "洪"],
        resolution: "3840x2160",
        size: "9.5MB",
        downloads: 654,
        date: "2023-12-03",
        image: "https://images.unsplash.com/photo-1542744095-fcf48d80b0fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    },
    {
        id: 9,
        name: "宇宙级机甲对决",
        category: "战斗",
        tags: ["宇宙级", "机甲对决", "战斗"],
        resolution: "5120x2880",
        size: "13.2MB",
        downloads: 987,
        date: "2023-11-30",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80"
    }
];

// 加载特色文章
function loadFeaturedPosts() {
    const featuredPostsContainer = document.getElementById('featured-posts');
    
    if (!featuredPostsContainer) return;
    
    // 只显示前3篇文章作为特色文章
    const featuredArticles = mechArticles.slice(0, 3);
    
    featuredPostsContainer.innerHTML = '';
    
    featuredArticles.forEach(article => {
        const postHTML = `
        <article class="post-card animate-on-scroll">
            <div class="post-image">
                <img src="${article.image}" alt="${article.title}">
                <div class="post-category">${article.category}</div>
            </div>
            <div class="post-content">
                <h3 class="post-title">${article.title}</h3>
                <div class="post-meta">
                    <span><i class="far fa-calendar"></i> ${article.date}</span>
                    <span><i class="far fa-clock"></i> ${article.readTime}</span>
                </div>
                <p class="post-excerpt">${article.excerpt}</p>
                <div class="post-footer">
                    <div class="post-tags">
                        ${article.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                    <button class="read-more" data-id="${article.id}">阅读全文 <i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        </article>
        `;
        
        featuredPostsContainer.innerHTML += postHTML;
    });
    
    // 为"阅读全文"按钮添加事件监听
    addReadMoreListeners();
}

// 加载所有文章
function loadAllPosts() {
    const allPostsContainer = document.getElementById('all-posts');
    
    if (!allPostsContainer) return;
    
    allPostsContainer.innerHTML = '';
    
    mechArticles.forEach(article => {
        const postHTML = `
        <article class="post-card animate-on-scroll">
            <div class="post-image">
                <img src="${article.image}" alt="${article.title}">
                <div class="post-category">${article.category}</div>
            </div>
            <div class="post-content">
                <h3 class="post-title">${article.title}</h3>
                <div class="post-meta">
                    <span><i class="far fa-calendar"></i> ${article.date}</span>
                    <span><i class="far fa-clock"></i> ${article.readTime}</span>
                </div>
                <p class="post-excerpt">${article.excerpt}</p>
                <div class="post-footer">
                    <div class="post-tags">
                        ${article.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                    <button class="read-more" data-id="${article.id}">阅读全文 <i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        </article>
        `;
        
        allPostsContainer.innerHTML += postHTML;
    });
    
    // 为"阅读全文"按钮添加事件监听
    addReadMoreListeners();
}

// 添加"阅读全文"按钮事件监听
function addReadMoreListeners() {
    const readMoreButtons = document.querySelectorAll('.read-more');
    
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const articleId = this.getAttribute('data-id');
            showArticleModal(articleId);
        });
    });
}

// 显示文章模态框
function showArticleModal(articleId) {
    const article = mechArticles.find(a => a.id == articleId);
    
    if (!article) return;
    
    // 创建模态框HTML
    const modalHTML = `
    <div class="modal active" id="article-modal">
        <div class="modal-content">
            <div class="modal-close"><i class="fas fa-times"></i></div>
            <h2>${article.title}</h2>
            <div class="post-meta" style="margin: 20px 0;">
                <span><i class="far fa-calendar"></i> ${article.date}</span>
                <span><i class="far fa-clock"></i> ${article.readTime}</span>
                <span><i class="fas fa-tag"></i> ${article.category}</span>
            </div>
            <div style="margin: 30px 0;">
                <img src="${article.image}" alt="${article.title}" style="width: 100%; border-radius: 15px; margin-bottom: 25px;">
                <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 25px;">
                    ${article.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                </div>
            </div>
            <div style="color: var(--light); line-height: 1.8; font-size: 1.1rem;">
                <p>${article.excerpt}</p>
                <p style="margin-top: 20px;">在第102集《吞噬星空》中，罗峰的机甲终于迎来了期待已久的觉醒时刻。从宇宙级八阶到九阶的突破，不仅仅是机甲能量的提升，更是对宇宙法则理解的质变。</p>
                <p style="margin-top: 15px;">随着机甲觉醒的完成，罗峰正式获得了踏入宇宙海的资格。宇宙海作为吞噬星空机甲宇宙的新篇章，充满了未知的危险与机遇。在这里，他将面对更强大的机甲敌人，探索更神秘的机甲遗迹。</p>
                <p style="margin-top: 15px;">本次机甲觉醒的关键在于金角巨兽基因与陨墨星传承的完美融合。两种不同体系的机甲技术相互补充，形成了独特的机甲进化路径。这种融合不仅提升了机甲的物理属性，还赋予了机甲特殊的宇宙法则亲和力。</p>
                <div style="background: rgba(0, 212, 255, 0.1); padding: 25px; border-radius: 15px; margin: 30px 0; border-left: 4px solid var(--energy-blue);">
                    <h4 style="color: var(--energy-blue); margin-bottom: 15px;">机甲觉醒关键数据</h4>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px;">
                        <div>
                            <div style="color: var(--gray);">机甲能量增幅</div>
                            <div style="color: var(--energy-blue); font-size: 1.5rem; font-weight: bold;">+427%</div>
                        </div>
                        <div>
                            <div style="color: var(--gray);">宇宙法则亲和度</div>
                            <div style="color: var(--energy-blue); font-size: 1.5rem; font-weight: bold;">+312%</div>
                        </div>
                        <div>
                            <div style="color: var(--gray);">机甲反应速度</div>
                            <div style="color: var(--energy-blue); font-size: 1.5rem; font-weight: bold;">+189%</div>
                        </div>
                        <div>
                            <div style="color: var(--gray);">星海适应等级</div>
                            <div style="color: var(--energy-blue); font-size: 1.5rem; font-weight: bold;">S级</div>
                        </div>
                    </div>
                </div>
                <p style="margin-top: 15px;">展望未来，罗峰的机甲之路还很长。从宇宙级到域主级，再到界主级，每一步都需要突破极限。宇宙海中等待他的将是更多的挑战，但也正是这些挑战，将推动他走向机甲巅峰。</p>
            </div>
            <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: center;">
                <div style="color: var(--gray);">
                    <i class="fas fa-eye"></i> 预计阅读完整文章需要 ${article.readTime}
                </div>
                <button class="btn btn-primary" id="download-article-btn">
                    <i class="fas fa-download"></i> 下载机甲日志PDF
                </button>
            </div>
        </div>
    </div>
    `;
    
    // 将模态框添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 添加关闭模态框事件
    document.querySelector('.modal-close').addEventListener('click', function() {
        document.getElementById('article-modal').remove();
    });
    
    // 点击模态框背景关闭
    document.getElementById('article-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
    
    // 下载按钮事件
    document.getElementById('download-article-btn').addEventListener('click', function() {
        alert('机甲日志PDF下载已开始！由于量子传输限制，预计需要3-5秒完成。');
        // 模拟下载
        setTimeout(() => {
            alert('机甲日志PDF下载完成！文件已保存到您的量子存储设备中。');
        }, 3000);
    });
}

// 加载角色数据
function loadCharacters() {
    const charactersGrid = document.getElementById('characters-grid');
    
    if (!charactersGrid) return;
    
    charactersGrid.innerHTML = '';
    
    mechCharacters.forEach(character => {
        const characterHTML = `
        <article class="post-card animate-on-scroll">
            <div class="post-image">
                <img src="${character.image}" alt="${character.name}">
                <div class="post-category">${character.title}</div>
            </div>
            <div class="post-content">
                <h3 class="post-title">${character.name}</h3>
                <div class="post-meta">
                    <span><i class="fas fa-robot"></i> ${character.status}</span>
                </div>
                <p class="post-excerpt">${character.description}</p>
                <div class="post-footer">
                    <div class="post-tags">
                        ${character.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                    <button class="read-more" data-character-id="${character.id}">查看机甲档案 <i class="fas fa-arrow-right"></i></button>
                </div>
            </div>
        </article>
        `;
        
        charactersGrid.innerHTML += characterHTML;
    });
    
    // 为角色按钮添加事件监听
    addCharacterDetailListeners();
}

// 添加角色详情按钮事件监听
function addCharacterDetailListeners() {
    const characterButtons = document.querySelectorAll('[data-character-id]');
    
    characterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const characterId = this.getAttribute('data-character-id');
            showCharacterModal(characterId);
        });
    });
}

// 显示角色模态框
function showCharacterModal(characterId) {
    const character = mechCharacters.find(c => c.id == characterId);
    
    if (!character) return;
    
    // 创建模态框HTML
    const modalHTML = `
    <div class="modal active" id="character-modal">
        <div class="modal-content">
            <div class="modal-close"><i class="fas fa-times"></i></div>
            <div style="display: flex; align-items: center; margin-bottom: 30px;">
                <div style="width: 150px; height: 150px; border-radius: 50%; overflow: hidden; margin-right: 30px; border: 3px solid var(--energy-blue);">
                    <img src="${character.image}" alt="${character.name}" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
                <div>
                    <h2 style="color: var(--energy-blue); margin-bottom: 10px;">${character.name}</h2>
                    <h3 style="color: var(--gray); margin-bottom: 15px;">${character.title}</h3>
                    <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                        ${character.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </div>
            <div style="color: var(--light); line-height: 1.8; font-size: 1.1rem;">
                <p>${character.description}</p>
                
                <h4 style="color: var(--energy-blue); margin: 30px 0 15px;">机甲详细资料</h4>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div style="background: rgba(0, 212, 255, 0.1); padding: 20px; border-radius: 10px;">
                        <div style="color: var(--gray); font-size: 0.9rem;">机甲等级</div>
                        <div style="color: var(--energy-blue); font-size: 1.5rem; font-weight: bold;">${character.status}</div>
                    </div>
                    <div style="background: rgba(157, 78, 221, 0.1); padding: 20px; border-radius: 10px;">
                        <div style="color: var(--gray); font-size: 0.9rem;">机甲属性</div>
                        <div style="color: var(--energy-purple); font-size: 1.5rem; font-weight: bold;">${character.tags[0] || '未知'}</div>
                    </div>
                </div>
                
                <h4 style="color: var(--energy-blue); margin: 30px 0 15px;">机甲战斗记录</h4>
                <div style="background: rgba(10, 14, 23, 0.8); padding: 25px; border-radius: 15px; margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: var(--gray);">主要机甲战果</span>
                        <span style="color: var(--energy-blue); font-weight: bold;">${character.name === '罗峰' ? '42胜3败' : character.name === '洪' ? '28胜5败' : character.name === '雷神' ? '25胜7败' : '未知'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px;">
                        <span style="color: var(--gray);">机甲击杀数</span>
                        <span style="color: var(--energy-blue); font-weight: bold;">${character.name === '罗峰' ? '186' : character.name === '洪' ? '97' : character.name === '雷神' ? '84' : '未知'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--gray);">机甲生存率</span>
                        <span style="color: var(--energy-blue); font-weight: bold;">${character.name === '罗峰' ? '93.3%' : character.name === '洪' ? '84.8%' : character.name === '雷神' ? '78.1%' : '未知'}</span>
                    </div>
                </div>
                
                <h4 style="color: var(--energy-blue); margin: 30px 0 15px;">机甲能力分析</h4>
                <div style="margin-bottom: 30px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                        <span style="color: var(--gray);">机甲攻击力</span>
                        <span style="color: var(--energy-blue); font-weight: bold;">${character.name === '罗峰' ? 'S级' : character.name === '洪' ? 'A+级' : character.name === '雷神' ? 'A级' : 'B级'}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${character.name === '罗峰' ? '95%' : character.name === '洪' ? '85%' : character.name === '雷神' ? '80%' : '60%'}"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin: 20px 0 10px;">
                        <span style="color: var(--gray);">机甲防御力</span>
                        <span style="color: var(--energy-blue); font-weight: bold;">${character.name === '罗峰' ? 'A+级' : character.name === '洪' ? 'A级' : character.name === '雷神' ? 'B+级' : 'B级'}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${character.name === '罗峰' ? '88%' : character.name === '洪' ? '80%' : character.name === '雷神' ? '75%' : '65%'}"></div>
                    </div>
                    
                    <div style="display: flex; justify-content: space-between; margin: 20px 0 10px;">
                        <span style="color: var(--gray);">机甲机动性</span>
                        <span style="color: var(--energy-blue); font-weight: bold;">${character.name === '罗峰' ? 'S级' : character.name === '洪' ? 'A级' : character.name === '雷神' ? 'S级' : 'C级'}</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${character.name === '罗峰' ? '92%' : character.name === '洪' ? '82%' : character.name === '雷神' ? '90%' : '50%'}"></div>
                    </div>
                </div>
                
                <p style="margin-top: 15px;">*以上数据基于最新机甲战斗记录分析，随着机甲升级会动态变化。</p>
            </div>
            <div style="margin-top: 40px; display: flex; justify-content: flex-end;">
                <button class="btn btn-primary" id="download-character-btn">
                    <i class="fas fa-download"></i> 下载机甲档案
                </button>
            </div>
        </div>
    </div>
    `;
    
    // 将模态框添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 添加关闭模态框事件
    document.querySelector('.modal-close').addEventListener('click', function() {
        document.getElementById('character-modal').remove();
    });
    
    // 点击模态框背景关闭
    document.getElementById('character-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
    
    // 下载按钮事件
    document.getElementById('download-character-btn').addEventListener('click', function() {
        alert(`正在下载${character.name}的机甲档案...`);
        // 模拟下载
        setTimeout(() => {
            alert(`${character.name}机甲档案下载完成！`);
        }, 2000);
    });
}

// 加载壁纸数据
function loadWallpapers() {
    const wallpapersGrid = document.getElementById('wallpapers-grid');
    
    if (!wallpapersGrid) return;
    
    wallpapersGrid.innerHTML = '';
    
    mechWallpapers.forEach(wallpaper => {
        const wallpaperHTML = `
        <div class="post-card animate-on-scroll" data-category="${wallpaper.category}">
            <div class="post-image">
                <img src="${wallpaper.image}" alt="${wallpaper.name}">
                <div class="post-category">${wallpaper.category}</div>
            </div>
            <div class="post-content">
                <h3 class="post-title">${wallpaper.name}</h3>
                <div class="post-meta">
                    <span><i class="fas fa-expand"></i> ${wallpaper.resolution}</span>
                    <span><i class="fas fa-hdd"></i> ${wallpaper.size}</span>
                    <span><i class="fas fa-download"></i> ${wallpaper.downloads}</span>
                </div>
                <div class="post-footer">
                    <div class="post-tags">
                        ${wallpaper.tags.map(tag => `<span class="post-tag">${tag}</span>`).join('')}
                    </div>
                    <button class="read-more" data-wallpaper-id="${wallpaper.id}">下载壁纸 <i class="fas fa-download"></i></button>
                </div>
            </div>
        </div>
        `;
        
        wallpapersGrid.innerHTML += wallpaperHTML;
    });
    
    // 初始化壁纸网格布局
    initWallpapersGrid();
    
    // 为壁纸按钮添加事件监听
    addWallpaperDownloadListeners();
    
    // 为壁纸筛选按钮添加事件监听
    addWallpaperFilterListeners();
}

// 初始化壁纸网格布局
function initWallpapersGrid() {
    const wallpapersGrid = document.getElementById('wallpapers-grid');
    
    if (!wallpapersGrid) return;
    
    // 使用Masonry布局（简化版）
    const items = wallpapersGrid.querySelectorAll('.post-card');
    
    // 重置所有项目的位置
    items.forEach(item => {
        item.style.marginBottom = '30px';
        item.style.breakInside = 'avoid';
    });
}

// 添加壁纸下载按钮事件监听
function addWallpaperDownloadListeners() {
    const wallpaperButtons = document.querySelectorAll('[data-wallpaper-id]');
    
    wallpaperButtons.forEach(button => {
        button.addEventListener('click', function() {
            const wallpaperId = this.getAttribute('data-wallpaper-id');
            downloadWallpaper(wallpaperId);
        });
    });
}

// 下载壁纸功能
function downloadWallpaper(wallpaperId) {
    const wallpaper = mechWallpapers.find(w => w.id == wallpaperId);
    
    if (!wallpaper) return;
    
    // 显示下载提示
    alert(`正在下载"${wallpaper.name}"...\n分辨率: ${wallpaper.resolution}\n大小: ${wallpaper.size}`);
    
    // 模拟下载过程
    setTimeout(() => {
        // 更新下载次数
        wallpaper.downloads++;
        
        // 更新壁纸页面显示
        const downloadCountElement = document.querySelector(`[data-wallpaper-id="${wallpaperId}"]`).closest('.post-card').querySelector('.fa-download').parentElement;
        if (downloadCountElement) {
            downloadCountElement.textContent = ` ${wallpaper.downloads}`;
        }
        
        // 更新数据库统计
        updateDatabaseStats();
        
        alert(`"${wallpaper.name}"下载完成！\n文件已保存到您的量子存储设备中。`);
    }, 2000);
}

// 添加壁纸筛选按钮事件监听
function addWallpaperFilterListeners() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除所有按钮的active类
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // 为当前按钮添加active类
            this.classList.add('active');
            
            // 获取筛选条件
            const filter = this.getAttribute('data-filter');
            
            // 筛选壁纸
            filterWallpapers(filter);
        });
    });
}

// 筛选壁纸
function filterWallpapers(filter) {
    const wallpapers = document.querySelectorAll('#wallpapers-grid .post-card');
    
    wallpapers.forEach(wallpaper => {
        if (filter === 'all' || wallpaper.getAttribute('data-category') === filter) {
            wallpaper.style.display = 'block';
        } else {
            wallpaper.style.display = 'none';
        }
    });
}

// 加载侧边栏数据
function loadSidebarData() {
    // 加载最新文章到侧边栏
    loadRecentPosts();
    
    // 添加分类点击事件
    addCategoryListeners();
    
    // 添加搜索功能
    addSearchFunctionality();
}

// 加载最新文章到侧边栏
function loadRecentPosts() {
    const recentPostsContainer = document.getElementById('recent-posts');
    
    if (!recentPostsContainer) return;
    
    // 只显示最近3篇文章
    const recentArticles = mechArticles.slice(0, 3);
    
    recentPostsContainer.innerHTML = '';
    
    recentArticles.forEach(article => {
        const recentPostHTML = `
        <div class="recent-post" data-article-id="${article.id}">
            <img src="${article.image}" alt="${article.title}">
            <div class="recent-post-content">
                <h4>${article.title}</h4>
                <span><i class="far fa-calendar"></i> ${article.date}</span>
            </div>
        </div>
        `;
        
        recentPostsContainer.innerHTML += recentPostHTML;
    });
    
    // 为最新文章添加点击事件
    const recentPosts = document.querySelectorAll('.recent-post');
    recentPosts.forEach(post => {
        post.addEventListener('click', function() {
            const articleId = this.getAttribute('data-article-id');
            showArticleModal(articleId);
        });
    });
}

// 添加分类点击事件
function addCategoryListeners() {
    const categoryItems = document.querySelectorAll('.category-item');
    
    categoryItems.forEach(item => {
        item.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            
            // 切换到博客页面
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            
            document.querySelector('[data-page="blog"]').classList.add('active');
            document.getElementById('blog-page').classList.add('active');
            
            // 筛选文章（这里简化处理，实际应该筛选文章）
            alert(`将显示"${category}"分类的文章`);
        });
    });
}

// 添加搜索功能
function addSearchFunctionality() {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) return;
    
    searchInput.addEventListener('keyup', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value.trim();
            
            if (searchTerm) {
                // 切换到博客页面
                document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
                document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
                
                document.querySelector('[data-page="blog"]').classList.add('active');
                document.getElementById('blog-page').classList.add('active');
                
                // 搜索文章（这里简化处理）
                alert(`搜索关键词: "${searchTerm}"\n将显示相关的机甲日志文章`);
                
                // 清空搜索框
                this.value = '';
            }
        }
    });
}

// 加载标签数据
function loadTags() {
    const footerTags = document.getElementById('footer-tags');
    
    if (!footerTags) return;
    
    // 收集所有文章和壁纸的标签
    const allTags = [];
    
    mechArticles.forEach(article => {
        article.tags.forEach(tag => {
            if (!allTags.includes(tag)) {
                allTags.push(tag);
            }
        });
    });
    
    mechWallpapers.forEach(wallpaper => {
        wallpaper.tags.forEach(tag => {
            if (!allTags.includes(tag)) {
                allTags.push(tag);
            }
        });
    });
    
    // 只显示前10个标签
    const tagsToShow = allTags.slice(0, 10);
    
    footerTags.innerHTML = '';
    
    tagsToShow.forEach(tag => {
        const tagHTML = `<span class="tag">${tag}</span>`;
        footerTags.innerHTML += tagHTML;
    });
    
    // 为标签添加点击事件
    const tags = document.querySelectorAll('#footer-tags .tag');
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            const tagText = this.textContent;
            
            // 切换到壁纸页面
            document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
            document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
            
            document.querySelector('[data-page="wallpapers"]').classList.add('active');
            document.getElementById('wallpapers-page').classList.add('active');
            
            // 筛选包含该标签的壁纸
            filterWallpapersByTag(tagText);
        });
    });
}

// 按标签筛选壁纸
function filterWallpapersByTag(tag) {
    const wallpapers = document.querySelectorAll('#wallpapers-grid .post-card');
    
    wallpapers.forEach(wallpaper => {
        const tags = Array.from(wallpaper.querySelectorAll('.post-tag')).map(t => t.textContent);
        
        if (tags.includes(tag)) {
            wallpaper.style.display = 'block';
        } else {
            wallpaper.style.display = 'none';
        }
    });
    
    // 更新筛选按钮状态
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => btn.classList.remove('active'));
    document.querySelector('.filter-btn[data-filter="all"]').classList.add('active');
    
    alert(`显示包含"${tag}"标签的机甲壁纸`);
}

// 初始化数据库功能
function initDatabase() {
    // 加载数据库表格数据
    loadDatabaseTable();
    
    // 添加上传新壁纸按钮事件
    const uploadBtn = document.getElementById('db-upload-new-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', showUploadModal);
    }
    
    // 添加导出按钮事件
    const exportBtn = document.getElementById('db-export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportDatabase);
    }
    
    // 添加导入按钮事件
    const importBtn = document.getElementById('db-import-btn');
    if (importBtn) {
        importBtn.addEventListener('click', importDatabase);
    }
    
    // 初始化编辑模式按钮
    initEditModeButton();
}

// 加载数据库表格数据
function loadDatabaseTable() {
    const tableBody = document.getElementById('db-table-body');
    
    if (!tableBody) return;
    
    tableBody.innerHTML = '';
    
    mechWallpapers.forEach(wallpaper => {
        const rowHTML = `
        <tr>
            <td>${wallpaper.id}</td>
            <td class="wallpaper-preview-cell">
                <div class="wallpaper-preview">
                    <img src="${wallpaper.image}" alt="${wallpaper.name}">
                </div>
            </td>
            <td>${wallpaper.name}</td>
            <td><span class="database-tag tag-${wallpaper.category}">${wallpaper.category}</span></td>
            <td>${wallpaper.resolution}</td>
            <td>${wallpaper.tags.map(tag => `<span class="post-tag">${tag}</span>`).join(' ')}</td>
            <td>${wallpaper.downloads}</td>
            <td>${wallpaper.date}</td>
            <td>
                <div class="table-actions">
                    <div class="table-action-btn" data-action="edit" data-id="${wallpaper.id}">
                        <i class="fas fa-edit"></i>
                    </div>
                    <div class="table-action-btn" data-action="download" data-id="${wallpaper.id}">
                        <i class="fas fa-download"></i>
                    </div>
                    <div class="table-action-btn" data-action="delete" data-id="${wallpaper.id}">
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            </td>
        </tr>
        `;
        
        tableBody.innerHTML += rowHTML;
    });
    
    // 为表格操作按钮添加事件
    addTableActionListeners();
    
    // 更新数据库统计
    updateDatabaseStats();
}

// 更新数据库统计
function updateDatabaseStats() {
    // 更新壁纸总数
    const totalWallpapers = document.getElementById('db-total-wallpapers');
    if (totalWallpapers) {
        totalWallpapers.textContent = mechWallpapers.length;
    }
    
    // 更新总大小（模拟计算）
    const totalSize = document.getElementById('db-total-size');
    if (totalSize) {
        let size = 0;
        mechWallpapers.forEach(wp => {
            size += parseFloat(wp.size);
        });
        totalSize.textContent = `${size.toFixed(1)} MB`;
    }
    
    // 更新总下载次数
    const totalDownloads = document.getElementById('db-total-downloads');
    if (totalDownloads) {
        let downloads = 0;
        mechWallpapers.forEach(wp => {
            downloads += wp.downloads;
        });
        totalDownloads.textContent = downloads;
    }
}

// 添加表格操作按钮事件监听
function addTableActionListeners() {
    const actionButtons = document.querySelectorAll('.table-action-btn');
    
    actionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const action = this.getAttribute('data-action');
            const id = this.getAttribute('data-id');
            
            switch (action) {
                case 'edit':
                    editWallpaper(id);
                    break;
                case 'download':
                    downloadWallpaper(id);
                    break;
                case 'delete':
                    deleteWallpaper(id);
                    break;
            }
        });
    });
}

// 编辑壁纸
function editWallpaper(id) {
    const wallpaper = mechWallpapers.find(w => w.id == id);
    
    if (!wallpaper) return;
    
    // 创建编辑模态框
    const modalHTML = `
    <div class="modal active" id="edit-wallpaper-modal">
        <div class="modal-content">
            <div class="modal-close"><i class="fas fa-times"></i></div>
            <h2>编辑机甲壁纸</h2>
            
            <div class="form-group">
                <label for="edit-wallpaper-name">机甲壁纸名称</label>
                <input type="text" id="edit-wallpaper-name" value="${wallpaper.name}">
            </div>
            
            <div class="form-group">
                <label for="edit-wallpaper-category">机甲分类</label>
                <select id="edit-wallpaper-category">
                    <option value="角色" ${wallpaper.category === '角色' ? 'selected' : ''}>角色</option>
                    <option value="场景" ${wallpaper.category === '场景' ? 'selected' : ''}>场景</option>
                    <option value="宇宙" ${wallpaper.category === '宇宙' ? 'selected' : ''}>宇宙</option>
                    <option value="战斗" ${wallpaper.category === '战斗' ? 'selected' : ''}>战斗</option>
                    <option value="概念" ${wallpaper.category === '概念' ? 'selected' : ''}>概念</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="edit-wallpaper-tags">机甲标签 (用逗号分隔)</label>
                <input type="text" id="edit-wallpaper-tags" value="${wallpaper.tags.join(', ')}">
            </div>
            
            <div class="form-group">
                <label for="edit-wallpaper-resolution">机甲分辨率</label>
                <input type="text" id="edit-wallpaper-resolution" value="${wallpaper.resolution}">
            </div>
            
            <div class="image-preview">
                <img src="${wallpaper.image}" alt="${wallpaper.name}">
            </div>
            
            <div class="button-group">
                <button class="btn btn-secondary" id="cancel-edit-btn">取消</button>
                <button class="btn btn-primary" id="save-edit-btn">保存机甲更改</button>
            </div>
        </div>
    </div>
    `;
    
    // 将模态框添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 添加关闭模态框事件
    document.querySelector('#edit-wallpaper-modal .modal-close').addEventListener('click', function() {
        document.getElementById('edit-wallpaper-modal').remove();
    });
    
    // 取消按钮事件
    document.getElementById('cancel-edit-btn').addEventListener('click', function() {
        document.getElementById('edit-wallpaper-modal').remove();
    });
    
    // 保存按钮事件
    document.getElementById('save-edit-btn').addEventListener('click', function() {
        // 获取表单值
        const name = document.getElementById('edit-wallpaper-name').value;
        const category = document.getElementById('edit-wallpaper-category').value;
        const tags = document.getElementById('edit-wallpaper-tags').value.split(',').map(tag => tag.trim());
        const resolution = document.getElementById('edit-wallpaper-resolution').value;
        
        // 更新壁纸数据
        wallpaper.name = name;
        wallpaper.category = category;
        wallpaper.tags = tags;
        wallpaper.resolution = resolution;
        
        // 更新数据库表格
        loadDatabaseTable();
        
        // 更新壁纸页面
        loadWallpapers();
        
        // 关闭模态框
        document.getElementById('edit-wallpaper-modal').remove();
        
        alert('机甲壁纸已成功更新！');
    });
    
    // 点击模态框背景关闭
    document.getElementById('edit-wallpaper-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
}

// 删除壁纸
function deleteWallpaper(id) {
    const confirmDelete = confirm('确定要删除这个机甲壁纸吗？此操作不可撤销。');
    
    if (confirmDelete) {
        // 找到壁纸索引
        const index = mechWallpapers.findIndex(w => w.id == id);
        
        if (index !== -1) {
            // 从数组中删除
            mechWallpapers.splice(index, 1);
            
            // 更新数据库表格
            loadDatabaseTable();
            
            // 更新壁纸页面
            loadWallpapers();
            
            alert('机甲壁纸已成功删除！');
        }
    }
}

// 显示上传模态框
function showUploadModal() {
    const modalHTML = `
    <div class="modal active" id="upload-wallpaper-modal">
        <div class="modal-content">
            <div class="modal-close"><i class="fas fa-times"></i></div>
            <h2>上传新机甲壁纸</h2>
            
            <div class="upload-wallpaper" id="upload-drop-area">
                <div class="upload-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <div class="upload-text">
                    <h3>拖放机甲壁纸文件到这里</h3>
                    <p>或点击选择文件</p>
                </div>
                <input type="file" id="wallpaper-file-input" accept="image/*" style="display: none;">
            </div>
            
            <div class="form-group">
                <label for="new-wallpaper-name">机甲壁纸名称</label>
                <input type="text" id="new-wallpaper-name" placeholder="例如：罗峰宇宙海机甲">
            </div>
            
            <div class="form-group">
                <label for="new-wallpaper-category">机甲分类</label>
                <select id="new-wallpaper-category">
                    <option value="角色">角色</option>
                    <option value="场景">场景</option>
                    <option value="宇宙">宇宙</option>
                    <option value="战斗">战斗</option>
                    <option value="概念">概念</option>
                </select>
            </div>
            
            <div class="form-group">
                <label for="new-wallpaper-tags">机甲标签 (用逗号分隔)</label>
                <input type="text" id="new-wallpaper-tags" placeholder="例如：罗峰, 宇宙海, 机甲觉醒">
            </div>
            
            <div class="image-preview" id="upload-preview" style="display: none;">
                <img id="preview-image" src="" alt="预览">
            </div>
            
            <div class="button-group">
                <button class="btn btn-secondary" id="cancel-upload-btn">取消</button>
                <button class="btn btn-primary" id="submit-upload-btn" disabled>上传机甲壁纸</button>
            </div>
        </div>
    </div>
    `;
    
    // 将模态框添加到页面
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // 文件输入和上传区域交互
    const fileInput = document.getElementById('wallpaper-file-input');
    const uploadArea = document.getElementById('upload-drop-area');
    const previewArea = document.getElementById('upload-preview');
    const previewImage = document.getElementById('preview-image');
    const submitBtn = document.getElementById('submit-upload-btn');
    
    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // 文件选择变化
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            // 检查文件类型
            if (!file.type.match('image.*')) {
                alert('请选择机甲图像文件！');
                return;
            }
            
            // 检查文件大小（限制5MB）
            if (file.size > 5 * 1024 * 1024) {
                alert('机甲图像文件太大！请选择小于5MB的文件。');
                return;
            }
            
            // 显示预览
            const reader = new FileReader();
            
            reader.onload = function(e) {
                previewImage.src = e.target.result;
                previewArea.style.display = 'flex';
                submitBtn.disabled = false;
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // 拖放功能
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        this.style.borderColor = 'var(--energy-blue)';
        this.style.background = 'rgba(0, 212, 255, 0.1)';
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        this.style.borderColor = '';
        this.style.background = '';
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            
            // 检查文件类型
            if (!file.type.match('image.*')) {
                alert('请拖放机甲图像文件！');
                return;
            }
            
            // 检查文件大小
            if (file.size > 5 * 1024 * 1024) {
                alert('机甲图像文件太大！请选择小于5MB的文件。');
                return;
            }
            
            // 设置文件输入
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            fileInput.files = dataTransfer.files;
            
            // 触发change事件
            fileInput.dispatchEvent(new Event('change'));
        }
    });
    
    // 添加关闭模态框事件
    document.querySelector('#upload-wallpaper-modal .modal-close').addEventListener('click', function() {
        document.getElementById('upload-wallpaper-modal').remove();
    });
    
    // 取消按钮事件
    document.getElementById('cancel-upload-btn').addEventListener('click', function() {
        document.getElementById('upload-wallpaper-modal').remove();
    });
    
    // 提交按钮事件
    document.getElementById('submit-upload-btn').addEventListener('click', function() {
        // 获取表单值
        const name = document.getElementById('new-wallpaper-name').value;
        const category = document.getElementById('new-wallpaper-category').value;
        const tags = document.getElementById('new-wallpaper-tags').value.split(',').map(tag => tag.trim());
        
        if (!name) {
            alert('请输入机甲壁纸名称！');
            return;
        }
        
        if (!previewImage.src) {
            alert('请选择机甲图像文件！');
            return;
        }
        
        // 创建新的壁纸对象
        const newWallpaper = {
            id: mechWallpapers.length + 1,
            name: name,
            category: category,
            tags: tags,
            resolution: '3840x2160',
            size: '5.0MB',
            downloads: 0,
            date: new Date().toISOString().split('T')[0],
            image: previewImage.src
        };
        
        // 添加到壁纸数组
        mechWallpapers.push(newWallpaper);
        
        // 更新数据库表格
        loadDatabaseTable();
        
        // 更新壁纸页面
        loadWallpapers();
        
        // 关闭模态框
        document.getElementById('upload-wallpaper-modal').remove();
        
        alert('机甲壁纸上传成功！');
    });
    
    // 点击模态框背景关闭
    document.getElementById('upload-wallpaper-modal').addEventListener('click', function(e) {
        if (e.target === this) {
            this.remove();
        }
    });
}

// 导出数据库
function exportDatabase() {
    // 创建导出数据
    const exportData = {
        version: '3.0',
        exportDate: new Date().toISOString(),
        wallpapers: mechWallpapers,
        articles: mechArticles,
        characters: mechCharacters
    };
    
    // 转换为JSON字符串
    const dataStr = JSON.stringify(exportData, null, 2);
    
    // 创建下载链接
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    // 创建下载链接元素
    const exportLink = document.createElement('a');
    exportLink.setAttribute('href', dataUri);
    exportLink.setAttribute('download', `机甲数据库_${new Date().toISOString().split('T')[0]}.json`);
    
    // 触发下载
    document.body.appendChild(exportLink);
    exportLink.click();
    document.body.removeChild(exportLink);
    
    alert('机甲数据库导出成功！');
}

// 导入数据库
function importDatabase() {
    // 创建文件输入元素
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.json';
    
    fileInput.addEventListener('change', function(e) {
        if (this.files && this.files[0]) {
            const file = this.files[0];
            
            const reader = new FileReader();
            
            reader.onload = function(e) {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // 验证数据格式
                    if (!importData.wallpapers || !importData.articles || !importData.characters) {
                        throw new Error('无效的机甲数据库文件格式');
                    }
                    
                    // 确认导入
                    const confirmImport = confirm(`确定要导入机甲数据库吗？\n这将导入：\n- ${importData.wallpapers.length} 张机甲壁纸\n- ${importData.articles.length} 篇机甲日志\n- ${importData.characters.length} 个机甲角色\n\n注意：这会覆盖当前数据！`);
                    
                    if (confirmImport) {
                        // 清空当前数据
                        mechWallpapers.length = 0;
                        mechArticles.length = 0;
                        mechCharacters.length = 0;
                        
                        // 导入新数据
                        importData.wallpapers.forEach(wp => mechWallpapers.push(wp));
                        importData.articles.forEach(article => mechArticles.push(article));
                        importData.characters.forEach(char => mechCharacters.push(char));
                        
                        // 重新加载所有数据
                        loadFeaturedPosts();
                        loadAllPosts();
                        loadCharacters();
                        loadWallpapers();
                        loadDatabaseTable();
                        loadSidebarData();
                        loadTags();
                        
                        alert('机甲数据库导入成功！');
                    }
                } catch (error) {
                    alert(`导入失败：${error.message}`);
                }
            };
            
            reader.readAsText(file);
        }
    });
    
    // 触发文件选择
    fileInput.click();
}

// 初始化编辑模式按钮
function initEditModeButton() {
    const editModeBtn = document.getElementById('edit-mode-btn');
    
    if (!editModeBtn) return;
    
    editModeBtn.addEventListener('click', function() {
        // 切换到数据库页面
        document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        
        document.querySelector('[data-page="database"]').classList.add('active');
        document.getElementById('database-page').classList.add('active');
        
        // 滚动到顶部
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// 页面加载完成后执行动画
window.addEventListener('load', function() {
    // 触发滚动动画检查
    setTimeout(() => {
        const event = new Event('scroll');
        window.dispatchEvent(event);
    }, 500);
});

// 添加CSS动画
const style = document.createElement('style');
style.textContent = `
@keyframes star-twinkle {
    0%, 100% { opacity: 0.2; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.1); }
}

@keyframes star-move {
    0% { transform: translate(0, 0); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 1; }
    100% { transform: translate(${Math.random() * 200 - 100}px, ${Math.random() * 200 - 100}px); opacity: 0; }
}
`;
document.head.appendChild(style);

// 机甲博客系统初始化完成
console.log('吞噬星空机甲宇宙博客系统已启动！ - blog.js:1914');
</script>
</body>
</html>
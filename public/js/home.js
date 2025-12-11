// Home page dynamic banners, carousels, and animations

// API_BASE já definido globalmente
let bannerAutoPlayInterval = null; // 🎯 Controle do autoplay
let bannerControlsSetup = false; // 🎯 Flag para evitar múltiplas inicializações

document.addEventListener('DOMContentLoaded', async () => {
  await initBanners();
  // Carrega e salva produtos no localStorage
  const products = await getProducts();
  if (products && products.length) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  await initCarousels();
  initScrollAnimations();
  
  // 🔄 LISTENER PARA SINCRONIZAÇÃO DE BANNERS COM ADMIN
  setupBannerSyncListener();
});

// 🔄 SINCRONIZAÇÃO DE BANNERS EM TEMPO REAL
function setupBannerSyncListener() {
  window.addEventListener('storage', (event) => {
    if (event.key === 'bannersChanged' && event.newValue === 'true') {
      console.log('📢 [BANNER SYNC] Mudança detectada, recarregando banners...');
      setTimeout(() => {
        initBanners();
      }, 500);
    }
  });

  // ❌ DESATIVADO: Verificação periódica causava loops
  // setInterval(async () => {
  //   const lastSync = localStorage.getItem('lastBannersSync');
  //   if (lastSync) {
  //     const syncTime = new Date(lastSync).getTime();
  //     const now = new Date().getTime();
  //     // Se foi atualizado nos últimos 30 segundos, recarregar
  //     if (now - syncTime < 30000) {
  //       console.log('📢 [BANNER SYNC] Sincronização periódica detectada');
  //       await initBanners();
  //       localStorage.removeItem('lastBannersSync');
  //     }
  //   }
  // }, 5000);
}

async function getBanners() {
  try {
    const resp = await fetch(`${API_BASE}/api/banners`);
    if (!resp.ok) throw new Error();
    return resp.json();
  } catch {
    return [];
  }
}

async function getFeaturedGroups() {
  try {
    const resp = await fetch(`${API_BASE}/api/featured-groups`);
    if (!resp.ok) throw new Error();
    return resp.json();
  } catch {
    return { maisVendidos: [], novidades: [], promocoes: [] };
  }
}

async function initBanners() {
  const container = document.querySelector('.banner-carousel .slides');
  if (!container) return;
  const list = await getBanners();
  const banners = list.filter(b => !!b.active).sort((a,b)=> (a.ord||0)-(b.ord||0));
  if (banners.length === 0) return;
  container.innerHTML = banners.map((b, idx) => `
    <div class="slide${idx===0?' active':''}" style="background-image:url('${b.image?.startsWith('http') ? b.image : API_BASE + b.image}')">
      <div class="slide-overlay">
        <h2>${b.title}</h2>
        <p>${b.subtitle||''}</p>
        ${b.link ? `<a href="${b.link}" class="btn-primary">Ver mais</a>` : ''}
      </div>
    </div>
  `).join('');
  setupBannerControls();
}

function setupBannerControls() {
  // 🎯 EVITA LOOP: Só configura os controles uma vez
  if (bannerControlsSetup) {
    // Se já configurado, só limpa e recria o interval
    if (bannerAutoPlayInterval) {
      clearInterval(bannerAutoPlayInterval);
      bannerAutoPlayInterval = null;
    }
    const slides = Array.from(document.querySelectorAll('.banner-carousel .slide'));
    let index = 0;
    function show(i) {
      slides.forEach((s, k) => s.classList.toggle('active', k === i));
      index = i;
    }
    function step(dir) {
      const n = slides.length;
      if (n === 0) return;
      show(((index + dir) % n + n) % n);
    }
    bannerAutoPlayInterval = setInterval(() => step(1), 5000);
    return;
  }
  
  const slides = Array.from(document.querySelectorAll('.banner-carousel .slide'));
  const prev = document.querySelector('.banner-carousel .nav.prev');
  const next = document.querySelector('.banner-carousel .nav.next');
  
  let index = 0;

  function show(i) {
    slides.forEach((s, k) => s.classList.toggle('active', k === i));
    index = i;
  }

  function step(dir) {
    const n = slides.length;
    if (n === 0) return;
    show(((index + dir) % n + n) % n);
  }

  if (prev) prev.addEventListener('click', () => step(-1));
  if (next) next.addEventListener('click', () => step(1));

  // 🎯 Criar APENAS UM intervalo
  bannerAutoPlayInterval = setInterval(() => step(1), 5000);
  bannerControlsSetup = true; // 🎯 Marca como já configurado
}

async function initCarousels() {
  const groups = await getFeaturedGroups();
  const products = await getProducts();
  const activeProducts = products.filter(p => p.active);
  const promotionalProducts = activeProducts.filter(p => p.priceOld && p.priceOld > p.priceCurrent);
  
  // Se houver produtos em destaque, mostra eles. Caso contrário, mostra todos ativos
  renderCarousel('#carousel-mais-vendidos', groups.maisVendidos || [], 'Mais Vendidos', activeProducts);
  renderCarousel('#carousel-novidades', groups.novidades || [], 'Novidades', activeProducts);
  // Para promoções, prioriza produtos com desconto
  renderCarousel('#carousel-promocoes', groups.promocoes || [], 'Promoções', promotionalProducts.length > 0 ? promotionalProducts : activeProducts);
}

async function renderCarousel(selector, ids, title, allProducts = null) {
  const el = document.querySelector(selector);
  if (!el) return;
  
  // Se não passou produtos, busca
  if (!allProducts) {
    const products = await getProducts();
    allProducts = products.filter(p => p.active);
  }
  
  // Se houver IDs específicos, filtra. Caso contrário, mostra os ativos
  let items;
  if (ids && ids.length > 0) {
    items = allProducts.filter(p => ids.includes(p.id));
  } else {
    // Se nenhum ID específico, mostra os produtos ativos
    items = allProducts.slice(0, 6); // Limita a 6 produtos
  }
  
  el.querySelector('.carousel-title').textContent = title;
  const track = el.querySelector('.carousel-track');
  if (!track) return;
  
  if (items.length === 0) {
    track.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #999;">Nenhum produto disponível</div>';
    return;
  }
  
  track.innerHTML = items.map(p => `
    <div class="carousel-card">
      <div class="card-img"><img src="${p.image?.startsWith('http') ? p.image : API_BASE + p.image}" alt="${p.name}" onerror="this.style.opacity='0.3'; this.onerror=null;"/></div>
      <h4>${p.name}</h4>
      <div class="price"><span class="old">R$ ${p.priceOld.toFixed(2)}</span><span class="current">R$ ${p.priceCurrent.toFixed(2)}</span></div>
      <button class="btn-add-cart" onclick="addToCart(${p.id}); setTimeout(()=>window.location.href='carrinho.html', 400);">Comprar</button>
    </div>
  `).join('');
  attachCarouselNav(el);
}

function attachCarouselNav(root) {
  const track = root.querySelector('.carousel-track');
  const prev = root.querySelector('.carousel-nav.prev');
  const next = root.querySelector('.carousel-nav.next');
  if (!track || !prev || !next) return;
  const cardWidth = 240; // approximate
  prev.addEventListener('click', () => track.scrollBy({ left: -cardWidth*2, behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: cardWidth*2, behavior: 'smooth' }));
}

function initScrollAnimations() {
  const animated = document.querySelectorAll('[data-animate]');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('in-view');
      }
    });
  }, { threshold: 0.15 });
  animated.forEach(el => io.observe(el));
}

// reuse from products.js
async function getProducts() {
  try {
    const resp = await fetch(`${API_BASE}/api/products`);
    if (!resp.ok) throw new Error();
    return resp.json();
  } catch { return []; }
}

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// .env.local 파일 읽기
const envPath = path.join(__dirname, '..', '.env.local');
let supabaseUrl = 'https://wekgpjpkxjxoeledqhbe.supabase.co';
let supabaseKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf-8');
    const lines = envContent.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('VITE_SUPABASE_URL=')) {
            supabaseUrl = trimmed.split('=')[1].replace(/['"]/g, '').trim();
        } else if (trimmed.startsWith('VITE_SUPABASE_ANON_KEY=')) {
            supabaseKey = trimmed.split('=')[1].replace(/['"]/g, '').trim();
        }
    }
} catch (err) {
    console.warn('⚠️  .env.local 파일을 읽을 수 없습니다. 기본값을 사용합니다.');
}

if (!supabaseKey) {
    console.error('❌ Supabase API 키가 설정되지 않았습니다.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const BASE_URL = 'https://www.chungwontour.com';

async function generateSitemap() {
    console.log('🗺️  Sitemap 생성 시작...');

    // 1. 고정 페이지들
    const staticPages = [
        { loc: `${BASE_URL}/`, priority: '1.0' },
        { loc: `${BASE_URL}/estimate`, priority: '0.8' },
        { loc: `${BASE_URL}/notices`, priority: '0.6' },
        { loc: `${BASE_URL}/faq`, priority: '0.6' },
        { loc: `${BASE_URL}/support`, priority: '0.6' },
    ];

    // 2. 테마 페이지들 가져오기
    const { data: themes, error: themesError } = await supabase
        .from('product_themes')
        .select('slug')
        .eq('is_active', true);

    if (themesError) {
        console.error('❌ 테마 조회 실패:', themesError);
    }

    const themePages = (themes || []).map(theme => ({
        loc: `${BASE_URL}/theme/${theme.slug}`,
        priority: '0.9'
    }));

    // 3. 상품 페이지들 가져오기 (DRAFT 제외)
    const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id, updated_at')
        .neq('status', 'DRAFT');

    if (productsError) {
        console.error('❌ 상품 조회 실패:', productsError);
    }

    const productPages = (products || []).map(product => ({
        loc: `${BASE_URL}/product/${product.id}`,
        lastmod: product.updated_at ? new Date(product.updated_at).toISOString().split('T')[0] : undefined,
        priority: '0.8'
    }));

    // 4. 모든 페이지 합치기
    const allPages = [...staticPages, ...themePages, ...productPages];

    // 5. XML 생성
    const currentDate = new Date().toISOString().split('T')[0];

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    allPages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${page.loc}</loc>\n`;
        xml += `    <lastmod>${page.lastmod || currentDate}</lastmod>\n`;
        if (page.priority) {
            xml += `    <priority>${page.priority}</priority>\n`;
        }
        xml += '  </url>\n\n';
    });

    xml += '</urlset>\n';

    // 6. 파일 저장
    const publicDir = path.join(__dirname, '..', 'public');
    const sitemapPath = path.join(publicDir, 'sitemap.xml');

    fs.writeFileSync(sitemapPath, xml, 'utf-8');

    console.log('✅ Sitemap 생성 완료!');
    console.log(`   - 총 ${allPages.length}개 페이지`);
    console.log(`   - 고정 페이지: ${staticPages.length}개`);
    console.log(`   - 테마 페이지: ${themePages.length}개`);
    console.log(`   - 상품 페이지: ${productPages.length}개`);
    console.log(`   - 저장 위치: ${sitemapPath}`);
}

generateSitemap().catch(err => {
    console.error('❌ Sitemap 생성 중 오류:', err);
    process.exit(1);
});

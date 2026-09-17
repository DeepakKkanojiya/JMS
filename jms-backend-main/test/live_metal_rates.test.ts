import { prisma } from '../src/database';
import { metalRateService } from '../src/modules/metal-rates/metalRate.service';
import { MetalType } from '../src/generated/prisma';

async function testLiveMetalRates() {
  console.log('[TEST] Starting Live Metal Rates & Owner Sync/Bulk Update Test...');

  // 1. Test getLiveMarketMetalRates
  console.log('[TEST 1] Testing Free Live Benchmark Feed...');
  const liveFeed = await metalRateService.getLiveMarketMetalRates();
  if (!liveFeed || !liveFeed.rates || liveFeed.rates.length === 0) {
    throw new Error('Live metal rates feed returned empty result');
  }

  const gold24k = liveFeed.rates.find((r) => r.metalType === 'GOLD' && r.purity === '24K');
  const silver999 = liveFeed.rates.find((r) => r.metalType === 'SILVER' && r.purity === '999');
  const platinum950 = liveFeed.rates.find((r) => r.metalType === 'PLATINUM' && r.purity === '950');

  if (!gold24k || !silver999 || !platinum950) {
    throw new Error('Required metal rates missing in live benchmark feed');
  }

  console.log(`[PASS] Live Benchmark: Gold 24K @ ₹${gold24k.ratePerGram}/g, Silver 999 @ ₹${silver999.ratePerGram}/g, Platinum @ ₹${platinum950.ratePerGram}/g`);

  // 2. Test syncLiveRatesToCompany for active company
  console.log('[TEST 2] Testing Owner Sync Live Rates to Company with 1.5% markup...');
  const company = await prisma.company.findFirst({ where: { isActive: true } });
  if (!company) {
    throw new Error('No active company found for testing');
  }

  const syncResult = await metalRateService.syncLiveRatesToCompany({
    companyId: company.id,
    markupPercent: 1.5,
    flatMarkupPerGram: 10,
  });

  if (syncResult.totalRatesUpdated === 0) {
    throw new Error('No rates were synced to company');
  }
  console.log(`[PASS] Synced ${syncResult.totalRatesUpdated} metal rates to company '${company.name}' with markup.`);

  // 3. Verify company active rate matches synced rate
  const activeRate = await metalRateService.getCurrentRate(company.id, MetalType.GOLD, '24K');
  const expectedRate = Math.round((gold24k.ratePerGram * 1.015 + 10) * 100) / 100;
  if (Number(activeRate.ratePerGram) !== expectedRate) {
    throw new Error(`Expected rate ${expectedRate}, but got ${activeRate.ratePerGram}`);
  }
  console.log(`[PASS] Active Gold 24K selling rate verified: ₹${activeRate.ratePerGram}/g`);

  // 4. Test Bulk Rate Update
  console.log('[TEST 3] Testing Owner Bulk Update Rates...');
  const bulkResult = await metalRateService.bulkUpdateCompanyRates({
    companyId: company.id,
    rates: [
      { metalType: MetalType.GOLD, purity: '24K', ratePerGram: 7300.0 },
      { metalType: MetalType.GOLD, purity: '22K', ratePerGram: 6900.0 },
      { metalType: MetalType.SILVER, purity: '999', ratePerGram: 90.0 },
    ],
  });

  if (bulkResult.totalRatesUpdated !== 3) {
    throw new Error(`Expected 3 rates updated, got ${bulkResult.totalRatesUpdated}`);
  }

  const newGoldRate = await metalRateService.getCurrentRate(company.id, MetalType.GOLD, '24K');
  if (Number(newGoldRate.ratePerGram) !== 7300.0) {
    throw new Error(`Expected 7300.0, got ${newGoldRate.ratePerGram}`);
  }
  console.log('[PASS] Bulk update verified: Gold 24K updated to ₹7300.0/g.');

  console.log('\n==================================================');
  console.log('ALL LIVE METAL RATE & OWNER MANAGEMENT TESTS PASSED');
  console.log('==================================================');
}

testLiveMetalRates()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error('[FAIL]', e);
    process.exit(1);
  });

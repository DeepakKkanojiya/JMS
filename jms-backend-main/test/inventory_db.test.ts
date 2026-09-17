import { prisma, connectDB, disconnectDB } from '../src/database';

async function runInventoryDbTests() {
  console.log('==============================================');
  console.log('RUNNING PHASE 3 - INVENTORY DB FOUNDATION TESTS');
  console.log('==============================================\n');

  try {
    await connectDB();

    // 1. Verify Seeded Inventory Items Exist
    console.log('[TEST 1] Verifying Seeded Inventory Items...');
    const items = await prisma.inventoryItem.findMany({
      include: {
        product: true,
        branch: true,
        inventoryTag: true,
        stockMovements: true,
        stockAdjustments: true,
      },
    });

    if (items.length < 2) {
      throw new Error(`Expected at least 2 seeded inventory items, found ${items.length}`);
    }
    console.log(`✓ Found ${items.length} inventory items in local DB.`);

    // 2. Verify Tag Hardware Independence (rfidEpc = null)
    console.log('\n[TEST 2] Verifying Hardware Independence (rfidEpc = null)...');
    const ringItem = items.find((i) => i.itemCode === 'INV-RING-00001');
    if (!ringItem || !ringItem.inventoryTag) {
      throw new Error('Seeded INV-RING-00001 or its tag not found');
    }

    if (ringItem.inventoryTag.rfidEpc !== null) {
      throw new Error(`Expected rfidEpc to be null for hardware independence, got ${ringItem.inventoryTag.rfidEpc}`);
    }
    console.log('✓ Inventory tags operate cleanly without RFID hardware (rfidEpc is null).');

    // 3. Verify Stock Movement & Adjustment Audit Relations
    console.log('\n[TEST 3] Verifying Stock Movement & Stock Adjustment Audit Records...');
    if (ringItem.stockMovements.length === 0) {
      throw new Error('Expected stock movements for INV-RING-00001');
    }
    if (ringItem.stockAdjustments.length === 0) {
      throw new Error('Expected stock adjustments for INV-RING-00001');
    }
    console.log(`✓ Found ${ringItem.stockMovements.length} movement(s) and ${ringItem.stockAdjustments.length} adjustment(s) for item.`);

    // 4. Test Audit History Protection (onDelete: Restrict)
    console.log('\n[TEST 4] Testing Audit History Protection (onDelete: Restrict)...');
    let deletionBlocked = false;
    try {
      await prisma.inventoryItem.delete({
        where: { id: ringItem.id },
      });
    } catch (error: any) {
      deletionBlocked = true;
      console.log('✓ Correctly blocked cascade deletion of InventoryItem containing movement/adjustment audit history.');
    }

    if (!deletionBlocked) {
      throw new Error('CRITICAL FAIL: Deletion of InventoryItem should have been restricted to preserve audit history!');
    }

    // 5. Test Unique Item Code Constraint
    console.log('\n[TEST 5] Testing Unique Item Code Constraint...');
    let duplicateItemBlocked = false;
    try {
      await prisma.inventoryItem.create({
        data: {
          productId: ringItem.productId,
          branchId: ringItem.branchId,
          itemCode: 'INV-RING-00001', // Duplicate item code
          grossWeight: 10.0,
          netWeight: 10.0,
          purity: '22K',
        },
      });
    } catch (error: any) {
      duplicateItemBlocked = true;
      console.log('✓ Duplicate item code creation rejected.');
    }
    if (!duplicateItemBlocked) {
      throw new Error('CRITICAL FAIL: Duplicate itemCode allowed!');
    }

    // 6. Test Unique Barcode & QR Code Constraints
    console.log('\n[TEST 6] Testing Unique Barcode & QR Constraints...');
    const tempItem = await prisma.inventoryItem.create({
      data: {
        productId: ringItem.productId,
        branchId: ringItem.branchId,
        itemCode: 'INV-TEST-TEMP-001',
        grossWeight: 4.0,
        netWeight: 4.0,
        purity: '22K',
      },
    });

    let duplicateBarcodeBlocked = false;
    try {
      await prisma.inventoryTag.create({
        data: {
          inventoryItemId: tempItem.id,
          barcode: 'BC-RING-00001', // Duplicate barcode
          qrCode: 'QR-TEST-TEMP-001',
        },
      });
    } catch (error: any) {
      duplicateBarcodeBlocked = true;
      console.log('✓ Duplicate barcode creation rejected.');
    }

    if (!duplicateBarcodeBlocked) {
      await prisma.inventoryItem.delete({ where: { id: tempItem.id } });
      throw new Error('CRITICAL FAIL: Duplicate barcode allowed!');
    }

    // Clean up temporary test item
    await prisma.inventoryItem.delete({ where: { id: tempItem.id } });
    console.log('✓ Temporary test cleanup complete.');

    // 7. Test RFID Uniqueness when provided
    console.log('\n[TEST 7] Testing Optional RFID Uniqueness...');
    const tempRfidItem1 = await prisma.inventoryItem.create({
      data: {
        productId: ringItem.productId,
        branchId: ringItem.branchId,
        itemCode: 'INV-TEST-RFID-001',
        grossWeight: 2.0,
        netWeight: 2.0,
        purity: '22K',
        inventoryTag: {
          create: {
            barcode: 'BC-TEST-RFID-001',
            qrCode: 'QR-TEST-RFID-001',
            rfidEpc: 'EPC-E200-0000-1111',
          },
        },
      },
    });

    let duplicateRfidBlocked = false;
    try {
      const tempRfidItem2 = await prisma.inventoryItem.create({
        data: {
          productId: ringItem.productId,
          branchId: ringItem.branchId,
          itemCode: 'INV-TEST-RFID-002',
          grossWeight: 2.0,
          netWeight: 2.0,
          purity: '22K',
          inventoryTag: {
            create: {
              barcode: 'BC-TEST-RFID-002',
              qrCode: 'QR-TEST-RFID-002',
              rfidEpc: 'EPC-E200-0000-1111', // Duplicate RFID EPC
            },
          },
        },
      });
      await prisma.inventoryItem.delete({ where: { id: tempRfidItem2.id } });
    } catch (error: any) {
      duplicateRfidBlocked = true;
      console.log('✓ Duplicate RFID EPC creation rejected.');
    }

    // Clean up temporary RFID item
    await prisma.inventoryItem.delete({ where: { id: tempRfidItem1.id } });
    if (!duplicateRfidBlocked) {
      throw new Error('CRITICAL FAIL: Duplicate RFID EPC allowed!');
    }

    console.log('\n==============================================');
    console.log('ALL PHASE 3 INVENTORY DB TESTS PASSED 100% SUCCESS');
    console.log('==============================================\n');
  } catch (error) {
    console.error('\n❌ PHASE 3 INVENTORY DB TESTS FAILED:', error);
    process.exit(1);
  } finally {
    await disconnectDB();
  }
}

runInventoryDbTests();

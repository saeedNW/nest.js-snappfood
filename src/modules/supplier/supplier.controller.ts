import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SupplierService } from './supplier.service';

@Controller('supplier')
export class SupplierController {
  constructor(private readonly supplierService: SupplierService) {}
}

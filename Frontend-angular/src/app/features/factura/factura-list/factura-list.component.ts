import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-factura-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './factura-list.component.html',
  styleUrls: ['./factura-list.component.scss']
})
export class FacturaListComponent {
  // Solo control visual del modal
  showModal = false;
  editingFactura: any | null = null;
  facturaForm = {
    numero: '',
    cliente: '',
    pedido: '',
    fecha_emision: '',
    fecha_vencimiento: '',
    total: 0,
    observaciones: ''
  };

  openCreateModal(): void {
    this.editingFactura = null;
    this.facturaForm = {
      numero: '',
      cliente: '',
      pedido: '',
      fecha_emision: '',
      fecha_vencimiento: '',
      total: 0,
      observaciones: ''
    };
    this.showModal = true;
  }

  editFactura(factura?: any): void {
    this.editingFactura = factura || {};
    this.facturaForm = {
      numero: factura?.numero || '',
      cliente: factura?.cliente || '',
      pedido: factura?.pedido || '',
      fecha_emision: factura?.fecha_emision || '',
      fecha_vencimiento: factura?.fecha_vencimiento || '',
      total: factura?.total ?? 0,
      observaciones: factura?.observaciones || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }
}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-factura-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './factura-list.component.html',
  styleUrls: ['./factura-list.component.scss']
})
export class FacturaListComponent implements OnInit {
  // Lista y estado visual
  facturas: any[] = [];
  loading = false;
  currentPage = 1;
  totalPages = 1;
  pageSize = 10;

  // Filtros visuales
  filters: any = {};

  // Modal
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

  ngOnInit(): void {
    this.loadFacturas();
    // Un único ejemplo
    if (this.facturas.length === 0) {
      this.facturas = [{
        id: '1',
        numero: 'F-0001',
        pedido: 'P-001',
        total: 125000.5,
        fecha_emision: '2025-11-10',
        cliente: 'Cliente Demo',
        observaciones: ''
      }];
      this.totalPages = 1;
    }
  }

  loadFacturas(): void {
    this.loading = true;
    setTimeout(() => { this.loading = false; }, 200);
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadFacturas();
  }

  clearFilters(): void {
    this.filters = {};
    this.currentPage = 1;
    this.loadFacturas();
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadFacturas();
    }
  }

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

  editFactura(factura: any): void {
    this.editingFactura = factura;
    this.facturaForm = {
      numero: factura.numero || '',
      cliente: factura.cliente || '',
      pedido: factura.pedido || '',
      fecha_emision: factura.fecha_emision || '',
      fecha_vencimiento: factura.fecha_vencimiento || '',
      total: factura.total ?? 0,
      observaciones: factura.observaciones || ''
    };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
  }

  saveFactura(): void {
    if (!this.facturaForm.numero.trim() || !this.facturaForm.cliente.trim() || !this.facturaForm.fecha_emision) {
      alert('Número, cliente y fecha de emisión son requeridos');
      return;
    }
    if (this.editingFactura) {
      // Actualización visual
      const idx = this.facturas.indexOf(this.editingFactura);
      if (idx > -1) {
        this.facturas[idx] = { ...this.editingFactura, ...this.facturaForm };
      }
    } else {
      // Creación visual
      const nueva = {
        id: String(this.facturas.length + 1),
        ...this.facturaForm
      };
      this.facturas.push(nueva);
    }
    this.closeModal();
  }

  deleteFactura(factura: any): void {
    const idx = this.facturas.indexOf(factura);
    if (idx > -1) {
      this.facturas.splice(idx, 1);
    }
  }
}

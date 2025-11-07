import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';

interface Pedido {
  id: number;
  usuario: number;
  carrito: number;
  direccion: string;
  total: number;
  estado: string;
  fechaCreacion: string;
  fechaEdicion: string;
}

@Component({ 
  selector: 'app-pedido-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pedido-list.component.html',
  styleUrl: './pedido-list.component.scss'
})
export class PedidoListComponent implements OnInit {
  pedidos: Pedido[] = [
    {
      id: 1,
      usuario: 1,
      carrito: 1,
      direccion: 'Calle 123',
      total: 2500000,
      estado: 'Pendiente',
      fechaCreacion: '2025-01-15',
      fechaEdicion: '2025-01-16'
    }
  ];

  constructor() { }

  ngOnInit() {
    // Lógica de inicialización si es necesaria
  }

  // Método para formatear precios en pesos colombianos
  formatearPrecio(precio: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // Método para crear un nuevo pedido
  crearPedido() {
    console.log('Crear nuevo pedido');
    // Aquí se implementaría la lógica para crear un nuevo pedido
    alert('Función de crear pedido - Por implementar');
  }

  // Método para editar un pedido existente
  editarPedido(pedido: Pedido) {
    console.log('Editar pedido:', pedido);
    // Aquí se implementaría la lógica para editar un pedido
    alert(`Editando pedido: ${pedido.id}`);
  }

  // Método para eliminar un pedido
  eliminarPedido(pedido: Pedido) {
    console.log('Eliminar pedido:', pedido);
    // Aquí se implementaría la lógica para eliminar un pedido
    if (confirm(`¿Estás seguro de eliminar el pedido ${pedido.id}?`)) {
      alert(`Pedido ${pedido.id} eliminado`);
    }
  }
}
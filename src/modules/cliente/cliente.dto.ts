export interface CreateClienteDto {
  contacto_id: number
  notas_cliente?: string
  // fecha_registro_cliente is handled by defaultValue in model
  activo?: boolean
}

export interface UpdateClienteDto extends Partial<CreateClienteDto> {}

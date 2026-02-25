import jsPDF from 'jspdf';

export const generarPDFCarrito = (carritoData, usuario, subtotal) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            let yPosition = 20;

            // ========== CONFIGURACIÓN INICIAL ==========
            doc.setProperties({
                title: 'Cotización AgroSoft',
                subject: 'Documento comercial',
                author: 'AgroSoft SAS',
                creator: 'Sistema AgroSoft',
                keywords: 'cotización, carrito, compra, productos agrícolas'
            });

            // ========== ENCABEZADO PROFESIONAL ==========
            // Logo y fondo de cabecera
            doc.setFillColor(46, 125, 50); // Verde AgroSoft
            doc.rect(0, 0, pageWidth, 50, 'F');

            // Nombre de la empresa
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28);
            doc.setFont('helvetica', 'bold');
            doc.text('AGROSOFT', pageWidth / 2, 22, { align: 'center' });

            // Slogan
            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            doc.text('Sistema Integral de Gestión Agrícola', pageWidth / 2, 30, { align: 'center' });

            // Información de contacto
            doc.setFontSize(9);
            doc.text('NIT: 901.234.567-8 • Bogotá D.C., Colombia', pageWidth / 2, 38, { align: 'center' });
            doc.text('Tel: +57 1 234 5678 • Email: info@agrosoft.com', pageWidth / 2, 43, { align: 'center' });

            // ========== TÍTULO DEL DOCUMENTO ==========
            yPosition = 60;
            doc.setTextColor(46, 125, 50);
            doc.setFontSize(20);
            doc.setFont('helvetica', 'bold');
            doc.text('COTIZACIÓN DE PRODUCTOS', pageWidth / 2, yPosition, { align: 'center' });

            // Línea decorativa naranja
            doc.setDrawColor(255, 152, 0); // Naranja AgroSoft
            doc.setLineWidth(0.8);
            doc.line(50, yPosition + 3, pageWidth - 50, yPosition + 3);

            yPosition += 15;

            // ========== INFORMACIÓN DEL DOCUMENTO ==========
            const numeroDocumento = `AG-${Date.now().toString().slice(-8)}`;
            const fechaGeneracion = new Date().toLocaleString('es-CO', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });

            doc.setTextColor(60, 60, 60);
            doc.setFontSize(10);
            doc.setFont('helvetica', 'bold');

            // Fecha y número en dos columnas
            doc.text(`Número de Documento: ${numeroDocumento}`, 20, yPosition);
            doc.text(`Fecha de Generación: ${fechaGeneracion}`, pageWidth - 20, yPosition, { align: 'right' });

            yPosition += 8;

            // ========== INFORMACIÓN DEL CLIENTE ==========
            doc.setFont('helvetica', 'bold');
            doc.text('DATOS DEL CLIENTE', 20, yPosition);

            yPosition += 7;
            doc.setFont('helvetica', 'normal');

            // Obtener nombre del usuario de diferentes formas posibles
            const nombreUsuario =
                usuario.nombre_usuario ||
                usuario.nombre ||
                usuario.nombres ||
                usuario.nombreCompleto ||
                usuario.username ||
                usuario.email?.split('@')[0] ||
                'Cliente AgroSoft';

            const emailUsuario = usuario.email || usuario.correo || 'No registrado';

            // Mostrar información del cliente (solo nombre y email)
            doc.text(`Nombre: ${nombreUsuario}`, 20, yPosition);
            doc.text(`Email: ${emailUsuario}`, pageWidth / 2, yPosition);

            yPosition += 12;

            // ========== TABLA DE PRODUCTOS ==========
            // Encabezado de tabla
            doc.setFillColor(46, 125, 50);
            doc.rect(15, yPosition - 5, pageWidth - 30, 10, 'F');

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');

            // Columnas de la tabla
            const columnPositions = {
                producto: 20,
                cantidad: 110,
                unidad: 130,
                precio: 150,
                subtotal: pageWidth - 20
            };

            doc.text('PRODUCTO', columnPositions.producto, yPosition);
            doc.text('CANT.', columnPositions.cantidad, yPosition);
            doc.text('UND.', columnPositions.unidad, yPosition);
            doc.text('PRECIO', columnPositions.precio, yPosition);
            doc.text('SUBTOTAL', columnPositions.subtotal, yPosition, { align: 'right' });

            yPosition += 12;

            // Formateador de precios
            const formatPrice = (price) => {
                if (typeof price === 'string') price = parseFloat(price);
                if (price < 100) price = price * 1000;
                return new Intl.NumberFormat('es-CO', {
                    style: 'currency',
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0
                }).format(price);
            };

            // Productos
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');

            if (carritoData.items && carritoData.items.length > 0) {
                carritoData.items.forEach((item, index) => {
                    // Alternar colores de fondo para mejor legibilidad
                    if (index % 2 === 0) {
                        doc.setFillColor(248, 249, 250);
                        doc.rect(15, yPosition - 3, pageWidth - 30, 15, 'F');
                    }

                    // Calcular precios
                    let precioUnitario = item.precio_unitario_al_momento || item.precio || 0;
                    let subtotalItem = item.subtotal || 0;

                    if (precioUnitario < 100) precioUnitario *= 1000;
                    if (subtotalItem < 100) subtotalItem *= 1000;

                    // Nombre del producto (truncado si es necesario)
                    const nombreProducto = item.nombre_producto && item.nombre_producto.length > 40
                        ? item.nombre_producto.substring(0, 40) + '...'
                        : item.nombre_producto || 'Producto sin nombre';

                    // Escribir datos del producto
                    doc.text(nombreProducto, columnPositions.producto, yPosition);
                    doc.text((item.cantidad || 1).toString(), columnPositions.cantidad, yPosition);
                    doc.text(item.unidad_medida || 'unidad', columnPositions.unidad, yPosition);
                    doc.text(formatPrice(precioUnitario), columnPositions.precio, yPosition);
                    doc.text(formatPrice(subtotalItem), columnPositions.subtotal, yPosition, { align: 'right' });

                    // Descripción del producto (opcional, en línea siguiente)
                    if (item.descripcion_producto && yPosition < 240) {
                        doc.setFontSize(8);
                        doc.setTextColor(120, 120, 120);
                        const descripcion = item.descripcion_producto.length > 80
                            ? item.descripcion_producto.substring(0, 80) + '...'
                            : item.descripcion_producto;

                        doc.text(descripcion, columnPositions.producto, yPosition + 5);
                        doc.setFontSize(9);
                        doc.setTextColor(60, 60, 60);
                        yPosition += 8;
                    }

                    yPosition += 12;

                    // Verificar si necesita nueva página
                    if (yPosition > 240 && index < carritoData.items.length - 1) {
                        // Pie de página actual
                        doc.setFontSize(8);
                        doc.setTextColor(100, 100, 100);
                        doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth / 2, 285, { align: 'center' });

                        // Nueva página
                        doc.addPage();
                        yPosition = 30;

                        // Encabezado de página continua
                        doc.setFillColor(248, 249, 250);
                        doc.rect(0, 0, pageWidth, 15, 'F');
                        doc.setTextColor(46, 125, 50);
                        doc.setFontSize(10);
                        doc.setFont('helvetica', 'bold');
                        doc.text(`COTIZACIÓN ${numeroDocumento} - Continuación`, pageWidth / 2, 10, { align: 'center' });

                        // Reestablecer posición y estilos
                        yPosition = 20;
                        doc.setTextColor(60, 60, 60);
                        doc.setFontSize(9);
                        doc.setFont('helvetica', 'normal');
                    }
                });
            } else {
                doc.text('No hay productos en el carrito', 20, yPosition);
                yPosition += 12;
            }

            // ========== RESUMEN DE TOTALES ==========
            if (yPosition > 200) {
                doc.addPage();
                yPosition = 30;
            }

            // Línea separadora
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.3);
            doc.line(120, yPosition, pageWidth - 20, yPosition);
            yPosition += 15;

            // Calcular total de productos
            const totalProductos = carritoData.items ? carritoData.items.reduce((sum, item) => sum + (item.cantidad || 0), 0) : 0;

            // Resumen de valores
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');

            doc.text(`Subtotal (${totalProductos} productos):`, 120, yPosition);
            doc.text(formatPrice(subtotal), pageWidth - 20, yPosition, { align: 'right' });
            yPosition += 8;

            doc.text('Costo de envío:', 120, yPosition);
            doc.setTextColor(40, 167, 69);
            doc.text('GRATIS', pageWidth - 20, yPosition, { align: 'right' });
            doc.setTextColor(60, 60, 60);
            yPosition += 8;

            // Línea más gruesa antes del total
            doc.setDrawColor(255, 152, 0);
            doc.setLineWidth(0.8);
            doc.line(120, yPosition, pageWidth - 20, yPosition);
            yPosition += 12;

            // Total final
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('TOTAL A PAGAR:', 120, yPosition);
            doc.setTextColor(40, 167, 69);
            doc.text(formatPrice(subtotal), pageWidth - 20, yPosition, { align: 'right' });

            yPosition += 20;

            // ========== TÉRMINOS Y CONDICIONES ==========
            doc.setTextColor(46, 125, 50);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('TÉRMINOS Y CONDICIONES', 20, yPosition);

            yPosition += 8;
            doc.setTextColor(60, 60, 60);
            doc.setFontSize(9);
            doc.setFont('helvetica', 'normal');

            const terminos = [
                'Este documento es una cotización y no constituye una factura oficial.',
                'Los precios están expresados en Pesos Colombianos (COP) e incluyen IVA.',
                'Válido por 15 días hábiles a partir de la fecha de emisión.',
                'El envío gratuito aplica para compras superiores a $50,000 COP dentro de Bogotá.',
                'Para otras ciudades, el costo de envío se calcula según la ubicación.',
                'Los productos están sujetos a disponibilidad de inventario.',
                'Los precios pueden variar sin previo aviso.',

            ];

            terminos.forEach((termino, index) => {
                if (yPosition > 270) {
                    doc.addPage();
                    yPosition = 20;
                }

                doc.text(`• ${termino}`, 25, yPosition);
                yPosition += 7;
            });

            // ========== PIE DE PÁGINA ==========
            yPosition = 280;
            doc.setDrawColor(200, 200, 200);
            doc.setLineWidth(0.2);
            doc.line(20, yPosition, pageWidth - 20, yPosition);
            yPosition += 5;

            doc.setFontSize(8);
            doc.setTextColor(100, 100, 100);
            doc.setFont('helvetica', 'italic');

            // Información de copyright
            doc.text('"Cultivando el futuro de la agricultura colombiana"', pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 4;

            doc.setFont('helvetica', 'normal');
            doc.text(`© ${new Date().getFullYear()} AgroSoft SAS - Todos los derechos reservados`, pageWidth / 2, yPosition, { align: 'center' });
            yPosition += 4;

            doc.text('www.agrosoft.com • info@agrosoft.com • Línea nacional: 01-800-AGROSOFT', pageWidth / 2, yPosition, { align: 'center' });

            // Número de página
            yPosition += 8;
            doc.text(`Página ${doc.internal.getNumberOfPages()}`, pageWidth / 2, yPosition, { align: 'center' });

            // ========== GUARDAR PDF ==========
            const fileName = `cotizacion-agrosoft-${numeroDocumento}.pdf`;
            doc.save(fileName);

            resolve({
                success: true,
                fileName,
                documentNumber: numeroDocumento,
                timestamp: fechaGeneracion,
                cliente: nombreUsuario
            });

        } catch (error) {
            console.error('Error generando PDF:', error);
            reject(error);
        }
    });
};
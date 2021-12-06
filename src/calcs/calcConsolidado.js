const consolidado = ({
  presupuesto,
  modificacion,
  comprometido,
  causado,
  pagado,
  mesActivo = 1,
}) => {
  var ctaConsolidado = [];
  presupuesto.map((ctaPresu) => {
    const theCtaMod = modificacion.find((ctaMod) => ctaMod.cuentaNo === ctaPresu.cuentaNo) || {
      cuentaNo: ctaPresu.cuentaNo,
      MontoMod: 0,
      MontoModMes: 0,
    };
    const theCtaComp = comprometido.find((ctafind) => ctafind.cuentaNo === ctaPresu.cuentaNo) || {
      cuentaNo: ctaPresu.cuentaNo,
      MontoComprometido: 0,
      MontoComprometidoMes: 0,
    };
    const theCtaCausa = causado.find((ctafind) => ctafind.cuentaNo === ctaPresu.cuentaNo) || {
      cuentaNo: ctaPresu.cuentaNo,
      MontoCausado: 0,
      MontoCausadoMes: 0,
    };
    const theCtaPagado = pagado.find((ctafind) => ctafind.cuentaNo === ctaPresu.cuentaNo) || {
      cuentaNo: ctaPresu.cuentaNo,
      MontoPag: 0,
      MontoPagMes: 0,
    };
    const theCtaDisponible = ctaPresu.Inicial + theCtaMod.MontoMod - theCtaPagado.MontoPag;
    // console.log(theCtaDisponible, Math.pow(-0.01, 2));
    ctaConsolidado = [
      ...ctaConsolidado,
      {
        mesActivo,
        cuentaNo: ctaPresu.cuentaNo,
        descripcion: ctaPresu.Descripcion,
        monto: ctaPresu.Inicial,
        montoModMes: theCtaMod.MontoModMes,
        montoMod: theCtaMod.MontoMod,
        montoAju: ctaPresu.Inicial + theCtaMod.MontoMod,
        montoComMes: theCtaComp.MontoComprometidoMes,
        montoCom: theCtaComp.MontoComprometido,
        montoCauMes: theCtaCausa.MontoCausadoMes,
        montoCau: theCtaCausa.MontoCausado,
        montoPagMes: theCtaPagado.MontoPagMes,
        montoPag: theCtaPagado.MontoPag,
        montoDis: theCtaDisponible,
        //montoDis: theCtaDisponible <= Math.pow(-0.01, 2) ? 0 : theCtaDisponible,
      },
    ];
  });

  return ctaConsolidado;
};

const detMesComprometido = ({ presupuesto, comprometido }) => {
  var ctaConsolidado = [];
  presupuesto.map((ctaPresu) => {
    const theCtaComp = comprometido
      .filter((ctafind) => ctafind.cuentaNo === ctaPresu.cuentaNo)
      .map((ctafind) => ({
        detalle: ctafind.detalle,
        cuentaNo: ctaPresu.cuentaNo,
        MontoComprometido: ctafind.detalle ? ctafind.montodetalle : ctafind.MontoComprometido,
        MontoComprometidoMes: ctafind.MontoComprometidoMes,
        fecha: `${ctafind.dia}-${ctafind.mes}`,
        nota: `${ctafind.comprobante} - Ref:${ctafind.referencia}`,
        descripcion: `${ctaPresu.Descripcion}`,
      }));

    ctaConsolidado = [
      ...ctaConsolidado,
      ...theCtaComp,
      // {
      //   cuentaNo: ctaPresu.cuentaNo,
      //   descripcion: ctaPresu.Descripcion,
      //   monto: ctaPresu.Inicial,
      //   montoComMes: theCtaComp.MontoComprometidoMes,
      //   montoCom: theCtaComp.MontoComprometido,
      // },
    ];
  });

  return ctaConsolidado;
};

module.exports = { consolidado, detMesComprometido };

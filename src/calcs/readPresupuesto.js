const { query } = require("../util/conectDb");
const cnndb = "./../PresupuestoData2013.accdb";
const orderBy = "ORDER BY Año, Part, Gene, Espe, Sub";
const {
  ceroleft,
  ordenCuenta,
  ordenCuentaDesc,
  numeroCuenta,
  addCuentaNo,
  sumaCuenta,
  consolaCompromiso,
  consolaPresup,
  numeroCuentaCreateFather,
} = require("./util");

const cuentaPresupuesto = async (anoTrabajo) => {
  const readCuenta = await query(
    cnndb,
    `Select * from Cuentas where [Año] = ${anoTrabajo} ${orderBy}`
  );

  const cuentaOriginal = JSON.parse(readCuenta);
  const ctasPorAno = addCuentaNo(cuentaOriginal.filter((cta) => cta.Año == anoTrabajo)).sort(
    ordenCuentaDesc
  );
  let ctaAjustada = addCuentaNo(cuentaOriginal.filter((cta) => cta.Año == anoTrabajo)).sort(
    ordenCuentaDesc
  );

  ctasPorAno.map((laCta) => {
    let findFather = ctaAjustada.find((cta) => cta.cuentaNo == laCta.fatherId);

    if (!findFather) {
      findFather = {
        cuentaNo: laCta.fatherId,
        fatherId: numeroCuentaCreateFather(laCta.fatherId),
        Descripcion: "<< CUENTA FALTANTE >>",
        Inicial: 0,
        Año: anoTrabajo,
      };
      ctaAjustada = [...ctaAjustada, findFather];
    }

    findFather = {
      ...findFather,
      Inicial: sumaCuenta(ctaAjustada, "Inicial", "fatherId", findFather.cuentaNo),
    };
    ctaAjustada = [
      ...ctaAjustada.filter((ctaAj) => ctaAj.cuentaNo !== findFather.cuentaNo),
      findFather,
    ];
  });

  // Ordena de nuevo la cuenta
  return ctaAjustada.sort(ordenCuenta);
};

const cuentaModificacion = async (ctaPresupuesto, anoTrabajo, mesTrabajo = 12) => {
  const ctaTotalizadora = "04.00.00.00.000";
  const ctasPorAno = ctaPresupuesto
    .filter((cta) => cta.cuentaNo !== ctaTotalizadora)
    .sort(ordenCuentaDesc);

  const readCuentaModif = await query(
    cnndb,
    `Select * from Modificaciones where [Año] = ${anoTrabajo} `
  );
  const cuentaOriginal = JSON.parse(readCuentaModif);
  let ctaAjustada = addCuentaNo(
    cuentaOriginal.filter((cta) => cta.Año == anoTrabajo && cta.Mes <= mesTrabajo)
  ).sort(ordenCuentaDesc);

  let ctaAjustadaII = [];
  ctasPorAno.map((laCta) => {
    const sumCtaMes = ctaAjustada.reduce((prev, curr) => {
      return (
        prev +
        (laCta.cuentaNo === curr.cuentaNo && curr.Mes === mesTrabajo ? curr.MontoMod : 0)
      );
    }, 0);

    const sumCtaTotal = ctaAjustada.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.cuentaNo ? curr.MontoMod : 0);
    }, 0);
    ctaAjustadaII = [
      ...ctaAjustadaII,
      { ...laCta, MontoMod: sumCtaTotal, MontoModMes: sumCtaMes },
    ];

    const sumCtaMesF = ctaAjustadaII.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.fatherId ? curr.MontoModMes : 0);
    }, 0);
    const sumCtaTotalF = ctaAjustadaII.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.fatherId ? curr.MontoMod : 0);
    }, 0);
    if (sumCtaTotalF !== 0) {
      ctaAjustadaII = [
        ...ctaAjustadaII.filter((ctaMod) => ctaMod.cuentaNo !== laCta.cuentaNo),
        { ...laCta, MontoMod: sumCtaTotalF, MontoModMes: sumCtaMesF },
      ];
    }
  });

  // Suma de Totales
  const sumCtaTotal400 = ctaAjustadaII.reduce((prev, curr) => {
    return prev + (ctaTotalizadora === curr.fatherId ? curr.MontoMod : 0);
  }, 0);
  const sumCtaTotalMes400 = ctaAjustadaII.reduce((prev, curr) => {
    return prev + (ctaTotalizadora === curr.fatherId ? curr.MontoModMes : 0);
  }, 0);

  const ctaTotal = {
    Año: 2020,
    Part: 4,
    Gene: 0,
    Espe: 0,
    Sub: 0,
    Ordi: 0,
    Nivel: 1,
    cuentaNo: ctaTotalizadora,
    fatherId: ctaTotalizadora,
    MontoMod: sumCtaTotal400,
    MontoModMes: sumCtaTotalMes400,
  };

  ctaAjustadaII = [ctaTotal, ...ctaAjustadaII];
  return ctaAjustadaII.sort(ordenCuenta);
};

const cuentaCompromiso = async (ctaPresupuesto, anoTrabajo, mesTrabajo = 12) => {
  const ctaTotalizadora = "04.00.00.00.000";
  const ctasPorAno = ctaPresupuesto
    .filter((cta) => cta.cuentaNo !== ctaTotalizadora)
    .sort(ordenCuentaDesc);

  const readCuentaComprometido = await query(
    cnndb,
    `Select * from Comprometido where [Año] = ${anoTrabajo} `
  );
  const cuentaOriginal = JSON.parse(readCuentaComprometido);
  let ctaAjustada = addCuentaNo(
    cuentaOriginal.filter((cta) => cta.Año == anoTrabajo && cta.Mes <= mesTrabajo)
  ).sort(ordenCuentaDesc);

  let ctaAjustadaII = [];
  ctasPorAno.map((laCta) => {
    const sumCtaMes = ctaAjustada.reduce((prev, curr) => {
      return (
        prev +
        (laCta.cuentaNo === curr.cuentaNo && curr.Mes === mesTrabajo
          ? curr.MontoComprometido
          : 0)
      );
    }, 0);
    const sumCtaTotal = ctaAjustada.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.cuentaNo ? curr.MontoComprometido : 0);
    }, 0);

    ctaAjustadaII = [
      ...ctaAjustadaII,
      {
        ...laCta,
        MontoComprometido: sumCtaTotal,
        MontoComprometidoMes: sumCtaMes,
        detalle: false,
      },
    ];

    const sumCtaMesF = ctaAjustadaII.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.fatherId ? curr.MontoComprometidoMes : 0);
    }, 0);
    const sumCtaTotalF = ctaAjustadaII.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.fatherId ? curr.MontoComprometido : 0);
    }, 0);
    if (sumCtaTotalF !== 0) {
      ctaAjustadaII = [
        ...ctaAjustadaII.filter((ctaMod) => ctaMod.cuentaNo !== laCta.cuentaNo),
        { ...laCta, MontoComprometido: sumCtaTotalF, MontoComprometidoMes: sumCtaMesF },
      ];
    }
  });

  // Suma de Totales
  const sumCtaTotal400 = ctaAjustadaII.reduce((prev, curr) => {
    return prev + (ctaTotalizadora === curr.fatherId ? curr.MontoComprometido : 0);
  }, 0);
  const sumCtaTotalMes400 = ctaAjustadaII.reduce((prev, curr) => {
    return prev + (ctaTotalizadora === curr.fatherId ? curr.MontoComprometidoMes : 0);
  }, 0);

  const ctaTotal = {
    Año: 2020,
    Part: 4,
    Gene: 0,
    Espe: 0,
    Sub: 0,
    Ordi: 0,
    Nivel: 1,
    cuentaNo: ctaTotalizadora,
    fatherId: ctaTotalizadora,
    MontoComprometido: sumCtaTotal400,
    MontoComprometidoMes: sumCtaTotalMes400,
  };
  ctaAjustadaII = [ctaTotal, ...ctaAjustadaII];
  return ctaAjustadaII.sort(ordenCuenta);
};

const cuentaCausado = async (ctaPresupuesto, anoTrabajo, mesTrabajo = 12) => {
  const ctaTotalizadora = "04.00.00.00.000";
  const ctasPorAno = ctaPresupuesto
    .filter((cta) => cta.cuentaNo !== ctaTotalizadora)
    .sort(ordenCuentaDesc);

  const readCuentaCausado = await query(
    cnndb,
    `Select * from Causado where [Año] = ${anoTrabajo} `
  );
  const cuentaOriginal = JSON.parse(readCuentaCausado);
  let ctaAjustada = addCuentaNo(
    cuentaOriginal.filter((cta) => cta.Año == anoTrabajo && cta.Mes <= mesTrabajo)
  ).sort(ordenCuentaDesc);

  let ctaAjustadaII = [];
  ctasPorAno.map((laCta) => {
    const sumCtaMes = ctaAjustada.reduce((prev, curr) => {
      return (
        prev +
        (laCta.cuentaNo === curr.cuentaNo && curr.Mes === mesTrabajo ? curr.MontoCausado : 0)
      );
    }, 0);
    const sumCtaTotal = ctaAjustada.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.cuentaNo ? curr.MontoCausado : 0);
    }, 0);
    ctaAjustadaII = [
      ...ctaAjustadaII,
      { ...laCta, MontoCausado: sumCtaTotal, MontoCausadoMes: sumCtaMes },
    ];

    const sumCtaMesF = ctaAjustadaII.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.fatherId ? curr.MontoCausadoMes : 0);
    }, 0);
    const sumCtaTotalF = ctaAjustadaII.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.fatherId ? curr.MontoCausado : 0);
    }, 0);
    if (sumCtaTotalF !== 0) {
      ctaAjustadaII = [
        ...ctaAjustadaII.filter((ctaMod) => ctaMod.cuentaNo !== laCta.cuentaNo),
        { ...laCta, MontoCausado: sumCtaTotalF, MontoCausadoMes: sumCtaMesF },
      ];
    }
  });

  // Suma de Totales
  const sumCtaTotal400 = ctaAjustadaII.reduce((prev, curr) => {
    return prev + (ctaTotalizadora === curr.fatherId ? curr.MontoCausado : 0);
  }, 0);
  const sumCtaTotalMes400 = ctaAjustadaII.reduce((prev, curr) => {
    return prev + (ctaTotalizadora === curr.fatherId ? curr.MontoCausadoMes : 0);
  }, 0);

  const ctaTotal = {
    Año: 2020,
    Part: 4,
    Gene: 0,
    Espe: 0,
    Sub: 0,
    Ordi: 0,
    Nivel: 1,
    cuentaNo: ctaTotalizadora,
    fatherId: ctaTotalizadora,
    MontoCausado: sumCtaTotal400,
    MontoCausadoMes: sumCtaTotalMes400,
  };
  ctaAjustadaII = [ctaTotal, ...ctaAjustadaII];
  return ctaAjustadaII.sort(ordenCuenta);
};

const cuentaPagado = async (ctaPresupuesto, anoTrabajo, mesTrabajo = 12) => {
  const ctaTotalizadora = "04.00.00.00.000";
  const ctasPorAno = ctaPresupuesto
    .filter((cta) => cta.cuentaNo !== ctaTotalizadora)
    .sort(ordenCuentaDesc);

  const readCuentaPagado = await query(
    cnndb,
    `Select * from Pagos where [Año] = ${anoTrabajo} `
  );
  const cuentaOriginal = JSON.parse(readCuentaPagado);

  let ctaAjustada = addCuentaNo(
    cuentaOriginal.filter((cta) => cta.Año == anoTrabajo && cta.Mes <= mesTrabajo)
  ).sort(ordenCuentaDesc);

  let ctaAjustadaII = [];
  ctasPorAno.map((laCta) => {
    const sumCtaMes = ctaAjustada.reduce((prev, curr) => {
      return (
        prev +
        (laCta.cuentaNo === curr.cuentaNo && curr.Mes === mesTrabajo ? curr.MontoPag : 0)
      );
    }, 0);
    const sumCtaTotal = ctaAjustada.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.cuentaNo ? curr.MontoPag : 0);
    }, 0);
    ctaAjustadaII = [
      ...ctaAjustadaII,
      { ...laCta, MontoPag: sumCtaTotal, MontoPagMes: sumCtaMes },
    ];

    const sumCtaMesF = ctaAjustadaII.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.fatherId ? curr.MontoPagMes : 0);
    }, 0);
    const sumCtaTotalF = ctaAjustadaII.reduce((prev, curr) => {
      return prev + (laCta.cuentaNo === curr.fatherId ? curr.MontoPag : 0);
    }, 0);
    if (sumCtaTotalF !== 0) {
      ctaAjustadaII = [
        ...ctaAjustadaII.filter((ctaMod) => ctaMod.cuentaNo !== laCta.cuentaNo),
        { ...laCta, MontoPag: sumCtaTotalF, MontoPagMes: sumCtaMesF },
      ];
    }
  });

  // Suma de Totales
  const sumCtaTotal400 = ctaAjustadaII.reduce((prev, curr) => {
    return prev + (ctaTotalizadora === curr.fatherId ? curr.MontoPag : 0);
  }, 0);
  const sumCtaTotalMes400 = ctaAjustadaII.reduce((prev, curr) => {
    return prev + (ctaTotalizadora === curr.fatherId ? curr.MontoPagMes : 0);
  }, 0);

  const ctaTotal = {
    Año: 2020,
    Part: 4,
    Gene: 0,
    Espe: 0,
    Sub: 0,
    Ordi: 0,
    Nivel: 1,
    cuentaNo: ctaTotalizadora,
    fatherId: ctaTotalizadora,
    MontoPag: sumCtaTotal400,
    MontoPagMes: sumCtaTotalMes400,
  };
  ctaAjustadaII = [ctaTotal, ...ctaAjustadaII];
  return ctaAjustadaII.sort(ordenCuenta);
};

const cuentaCompromisoDet = async (
  ctaPresupuesto,
  cuentaDetalle,
  anoTrabajo,
  mesTrabajo = 12
) => {
  const ctaTotalizadora = cuentaDetalle;
  const ctasPorAno = ctaPresupuesto.find((cta) => cta.cuentaNo === ctaTotalizadora);

  const readCuentaComprometido = await query(
    cnndb,
    `Select * from Comprometido where [Año] = ${anoTrabajo}`
  );

  const cuentaOriginal = JSON.parse(readCuentaComprometido);
  let ctaAjustada = addCuentaNo(
    cuentaOriginal.filter((cta) => cta.Año == anoTrabajo && cta.Mes == mesTrabajo)
  ).sort(ordenCuentaDesc);

  ctaAjustada = ctaAjustada.filter((ctad) => ctad.fatherId === cuentaDetalle);
  //console.log(cuentaDetalle);
  //console.log(ctaAjustada);

  let ctaAjustadaII = [];
  // ctasPorAno.map((laCta) => {
  //   const sumCtaMes = ctaAjustada.reduce((prev, curr) => {
  //     return (
  //       prev +
  //       (laCta.cuentaNo === curr.cuentaNo && curr.Mes === mesTrabajo
  //         ? curr.MontoComprometido
  //         : 0)
  //     );
  //   }, 0);
  //   const sumCtaTotal = ctaAjustada.reduce((prev, curr) => {
  //     return prev + (laCta.cuentaNo === curr.cuentaNo ? curr.MontoComprometido : 0);
  //   }, 0);

  //   ctaAjustadaII = [
  //     ...ctaAjustadaII,
  //     {
  //       ...laCta,
  //       MontoComprometido: sumCtaTotal,
  //       MontoComprometidoMes: sumCtaMes,
  //       detalle: false,
  //     },
  //   ];

  //   const sumCtaMesF = ctaAjustadaII.reduce((prev, curr) => {
  //     return prev + (laCta.cuentaNo === curr.fatherId ? curr.MontoComprometidoMes : 0);
  //   }, 0);
  //   const sumCtaTotalF = ctaAjustadaII.reduce((prev, curr) => {
  //     return prev + (laCta.cuentaNo === curr.fatherId ? curr.MontoComprometido : 0);
  //   }, 0);
  //   if (sumCtaTotalF !== 0) {
  //     ctaAjustadaII = [
  //       ...ctaAjustadaII.filter((ctaMod) => ctaMod.cuentaNo !== laCta.cuentaNo),
  //       { ...laCta, MontoComprometido: sumCtaTotalF, MontoComprometidoMes: sumCtaMesF },
  //     ];
  //   }
  // });

  // Suma de Totales
  const sumCtaTotal400 = ctaAjustada.reduce((prev, curr) => {
    return prev + (ctaTotalizadora === curr.fatherId ? curr.MontoComprometido : 0);
  }, 0);

  const ctaTotal = {
    ...ctasPorAno,
    // cuentaNo: ctaTotalizadora,
    // fatherId: ctaTotalizadora,
    MontoComprometido: sumCtaTotal400,
  };
  ctaAjustadaII = [ctaTotal, ...ctaAjustada];
  console.log(ctaAjustadaII);
  return ctaAjustadaII.sort(ordenCuenta);
};

module.exports = {
  cuentaPresupuesto,
  cuentaModificacion,
  cuentaCompromisoDet,
  cuentaCompromiso,
  cuentaCausado,
  cuentaPagado,
};

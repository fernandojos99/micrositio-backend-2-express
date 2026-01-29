-- Tablas básicas

CREATE TABLE categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
);

CREATE TABLE empleado (
  id_empleado SERIAL PRIMARY KEY UNIQUE,
  nombre_pila VARCHAR(40) NOT NULL,
  apellido_paterno VARCHAR(20) NOT NULL,
  apellido_materno VARCHAR(20),
  celular VARCHAR(20) UNIQUE, 
  correo VARCHAR(40) NOT NULL UNIQUE,
  numero_empleado VARCHAR(6) NOT NULL UNIQUE,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE proyecto (
  id_proyecto SERIAL PRIMARY KEY,
  titulo VARCHAR(50) NOT NULL,
  descripcion TEXT,
  estado VARCHAR(10) DEFAULT 'ACTIVO' CHECK (estado IN ('ACTIVO', 'INACTIVO', 'COMPLETADO')),
  fecha_inicio DATE,
  fecha_fin_estimada DATE,
  id_categoria INTEGER NOT NULL,
  id_lider INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Restricción para categoría
  CONSTRAINT fk_proyecto_categoria
    FOREIGN KEY (id_categoria)
    REFERENCES categoria(id_categoria)
    ON DELETE RESTRICT,
    
  -- Restricción para líder (empleado)
  CONSTRAINT fk_proyecto_lider
    FOREIGN KEY (id_lider)
    REFERENCES empleado(id_empleado)
    ON DELETE SET NULL,
    
  -- Restricción adicional para fechas
  CONSTRAINT chk_fechas_validas
    CHECK (fecha_fin_estimada IS NULL OR fecha_inicio IS NULL OR fecha_fin_estimada >= fecha_inicio)
);

CREATE TABLE experimento_tipo (
    id_experimento_tipo SERIAL PRIMARY KEY,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('DESCUBRIMIENTO', 'VALIDACION')),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    icono VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
);



-- Tabla secuencia (corregida relación padre)
CREATE TABLE secuencia (
  id_secuencia SERIAL PRIMARY KEY,
  id_proyecto INTEGER REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
  id_testing_card_padre INTERGER  REFERENCES testing_card(id_testing_card) ON CASCADE;
  nombre VARCHAR(50) NOT NULL,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  dia_inicio DATE ,
  dia_fin DATE ,
  estado VARCHAR(10)
  CHECK (estado IN ('EN PLANEACION', 'EN VALIDACION', 'EN EJECUCION', 'EN ANALISIS', 'TERMINADO', 'EN PROCESO', 'CANCELADO'))
);

-- Testing Cards (árbol jerárquico)
CREATE TABLE testing_card (
  id_testing_card SERIAL PRIMARY KEY,
  id_secuencia INTEGER REFERENCES secuencia(id_secuencia) ON DELETE CASCADE,
  padre_id INTEGER REFERENCES testing_card(id_testing_card) ON DELETE CASCADE,
  titulo VARCHAR(300) NOT NULL,
  hipotesis TEXT NOT NULL,
  id_experimento_tipo INTEGER NOT NULL REFERENCES experimento_tipo(id_experimento_tipo),
  descripcion TEXT NOT NULL,
  dia_inicio DATE NOT NULL,
  dia_fin DATE NOT NULL,
  anexo_url VARCHAR(500),
  id_responsable INTEGER NOT NULL REFERENCES empleado(id_empleado),
  status VARCHAR(30) DEFAULT 'EN PLANEACION' CHECK
   (status IN ('EN PLANEACION', 'EN VALIDACION', 'EN ANALISIS', 'CANCELADO', 'TERMINADO'));
  ),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE secuencia
ADD COLUMN id_padre INTEGER REFERENCES testing_card(id_testing_card) ON DELETE CASCADE;

-- Learning Cards (relación 1:1 con TC)
CREATE TABLE learning_card (
  id SERIAL PRIMARY KEY,
  id_testing_card INTEGER NOT NULL REFERENCES testing_card(id_testing_card) ON DELETE CASCADE,
  resultado TEXT,
  hallazgo TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  estado VARCHAR(15) DEFAULT 'CUMPLIDO' CHECK (estado IN ('CUMPLIDO', 'RECHAZADO', 'REPETIR'),
  id_responsable INTEGER NOT NULL REFERENCES empleado(id_empleado),
);

-- Tablas de relación
CREATE TABLE celula_proyecto (
  id SERIAL PRIMARY KEY,
  id_empleado INTEGER NOT NULL REFERENCES empleado(id_empleado) ON DELETE CASCADE,
  id_proyecto INTEGER NOT NULL REFERENCES proyecto(id_proyecto) ON DELETE CASCADE,
  activo BOOLEAN DEFAULT TRUE,
  UNIQUE (id_empleado, id_proyecto)
);




CREATE TABLE metrica_testing_card (
    id_metrica SERIAL PRIMARY KEY,
    id_testing_card INTEGER NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    operador VARCHAR(10) NOT NULL,
    criterio TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_testing_card 
        FOREIGN KEY (id_testing_card) 
        REFERENCES testing_card(id_testing_card)
        ON DELETE CASCADE  -- Opcional: borra métricas si se borra la testing card
);

CREATE TABLE node_positions (
  id_posicion SERIAL PRIMARY KEY,
  id_secuencia INTEGER NOT NULL,
  node_type VARCHAR(20) NOT NULL CHECK (node_type IN ('testing', 'learning')),
  node_id INTEGER NOT NULL,
  position_x DECIMAL(10,2) NOT NULL,
  position_y DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Restricción de clave foránea hacia la tabla 'secuencia'
  CONSTRAINT fk_secuencia 
    FOREIGN KEY (id_secuencia) 
    REFERENCES secuencia(id)
    ON DELETE CASCADE,  -- Opcional: Define qué pasa si se borra la secuencia
  
  -- Restricción única para evitar duplicados
  CONSTRAINT unique_node_position UNIQUE (id_secuencia, node_type, node_id)
);

-- Índices adicionales
CREATE INDEX idx_secuencia ON node_positions (id_secuencia);
CREATE INDEX idx_node_lookup ON node_positions (node_type, node_id);

CREATE TABLE url_testing_card (
    id_url_tc SERIAL PRIMARY KEY,
    id_testing_card INTEGER NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_testing_card
        FOREIGN KEY (id_testing_card)
        REFERENCES testing_card(id_testing_card)
        ON DELETE CASCADE
);

CREATE TABLE url_learning_card (
    id_url_lc SERIAL PRIMARY KEY,
    id_learning_card INTEGER NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_learning_card
        FOREIGN KEY (id_learning_card)
        REFERENCES learning_card(id)
        ON DELETE CASCADE
);

CREATE TABLE learning_card_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_card_id SERIAL NOT NULL REFERENCES learning_card(id) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_type TEXT, -- opcional: 'pdf', 'image', 'video', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índice para búsquedas más rápidas
CREATE INDEX idx_learning_card_documents_card_id ON learning_card_documents(learning_card_id);

CREATE TABLE testing_card_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  testing_card_id SERIAL NOT NULL REFERENCES testing_card(id_testing_card) ON DELETE CASCADE,
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_type TEXT, -- opcional: 'pdf', 'image', 'video', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear índice para búsquedas más rápidas
CREATE INDEX idx_testing_card_documents_card_id ON testing_card_documents(testing_card_id);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id_usuario  UUID  PRIMARY KEY,
    alias VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(50) NOT NULL,
    tipo VARCHAR(10) NOT NULL CHECK (tipo IN ('EDITOR', 'VISITANTE')),
    id_empleado INTEGER NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_empleado_editor 
        FOREIGN KEY (id_empleado) 
        REFERENCES empleado(id_empleado) 
        ON DELETE SET NULL,
    
    /**CONSTRAINT chk_editor_tiene_empleado 
        CHECK (
            (tipo = 'EDITOR' AND id_empleado IS NOT NULL) OR 
            (tipo = 'VISITANTE' AND id_empleado IS NULL)
        )*/
);

-- Tabla de relación usuario-proyectos (para visitantes)
CREATE TABLE usuario_proyecto (
    id_usuario UUID  NOT NULL,
    id_proyecto INTEGER NOT NULL,
    
    PRIMARY KEY (id_usuario, id_proyecto),
    
    CONSTRAINT fk_usuario 
        FOREIGN KEY (id_usuario) 
        REFERENCES usuarios(id_usuario) 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_proyecto 
        FOREIGN KEY (id_proyecto) 
        REFERENCES proyecto(id_proyecto) 
        ON DELETE CASCADE
    

);

---------------------
--------------------
---------------------
-- TABLAS PARA AGENTES  (PROMPTS )
--------------------

CREATE TABLE agente (
    id_agente  SERIAL PRIMARY KEY,
    nombre VARCHAR(150),
    link TEXT,
    descripcion TEXT,
    prompt TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE categoria_agente (
    id_categoria SERIAL PRIMARY KEY,
    nombre_categoria VARCHAR(100),
    descripcion TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla intermedia para la relación muchos a muchos
CREATE TABLE relacion_agente_categoria (
    id_agente INT,
    id_categoria INT,
    es_principal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id_agente, id_categoria),
    FOREIGN KEY (id_agente) REFERENCES agente(id_agente) ON DELETE CASCADE,
    FOREIGN KEY (id_categoria) REFERENCES categoria_agente(id_categoria) ON DELETE CASCADE
);


CREATE TABLE plantilla_testing_card(
  id_plantilla_testing_card UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_testing_card INTEGER references testing_card(id_testing_card),
  id_empleado INTEGER references empleado(id_empleado),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plantilla_secuencia(
  id_plantilla_secuencia UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_secuencia INTEGER references secuencia(id_secuencia),
  id_empleado INTEGER references empleado(id_empleado),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE plantilla_metrica_tc(
  id_plantilla_metrica UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  id_metrica INTEGER references secuencia(id_testing_card),
  id_empleado INTEGER references empleado(id_empleado),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

// --- TABLA DE FORMATOS (PLANITLLAS PARA LOS EXPERIMENTOS)
CREATE TABLE formato (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_name TEXT NOT NULL,
  document_url TEXT NOT NULL,
  document_type varchar(7), -- opcional: 'pdf', 'image', 'video', etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  categoria VARCHAR(20)
);

CREATE TABLE url_formato (
    id_url_formato SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    categoria VARCHAR(20),
    descripcion text;
);



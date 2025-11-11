-- Tabela: paciente
CREATE TABLE paciente (
    id_paciente     SERIAL,
    nome            VARCHAR(200) NOT NULL,
    cpf             VARCHAR(14) NOT NULL,
    data_nascimento DATE,
    endereco        TEXT,

    CONSTRAINT pk_paciente PRIMARY KEY (id_paciente),
    CONSTRAINT uq_paciente_cpf UNIQUE (cpf)
);

-- Tabela: departamento
CREATE TABLE departamento (
    id_departamento     SERIAL,
    nome                VARCHAR(100) NOT NULL,
    localizacao         VARCHAR(100),

    CONSTRAINT pk_dep PRIMARY KEY (id_departamento),
    CONSTRAINT uq_dep_nome UNIQUE (nome)
);

-- Tabela: medico
CREATE TABLE medico (
    id_medico        SERIAL,
    nome             VARCHAR(200) NOT NULL,
    crm              VARCHAR(30) NOT NULL,
    especialidade    VARCHAR(100),
    data_contratacao DATE,
	id_departamento  INT,
	
	CONSTRAINT fk_medico_setor FOREIGN KEY (id_departamento)
        REFERENCES departamento (id_departamento)
        	ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT pk_medico PRIMARY KEY (id_medico),
    CONSTRAINT uq_medico_crm UNIQUE (crm)
);


-- Tabela: consulta
CREATE TABLE consulta (
	id_consulta		SERIAL,
    id_paciente		INT NOT NULL,
    id_medico       INT NOT NULL,
    data_consulta   DATE NOT NULL,
    duracao_min     INT,
    diagnostico     TEXT,
    observacoes     TEXT,

    CONSTRAINT pk_consulta PRIMARY KEY (id_consulta),
    CONSTRAINT uq_consulta_unica UNIQUE (id_paciente, id_medico, data_consulta),
    CONSTRAINT fk_consulta_paciente FOREIGN KEY (id_paciente)
        REFERENCES paciente (id_paciente)
        ON DELETE CASCADE,
    CONSTRAINT fk_consulta_medico FOREIGN KEY (id_medico)
        REFERENCES medico (id_medico)
        ON DELETE CASCADE
);


-- Valores para teste:

INSERT INTO departamento (nome, localizacao)
VALUES  ('Cardiologia', 'Bloco A - 1º Andar'),
        ('Pediatria', 'Bloco B - 2º Andar'),
        ('Ortopedia', 'Bloco C - Térreo');

INSERT INTO paciente (nome, cpf, data_nascimento, endereco)
VALUES  ('João da Silva', '123.456.789-00', '1985-04-23', 'Rua das Flores, 123'),
        ('Maria Oliveira', '987.654.321-00', '1992-11-10', 'Av. Paulista, 999'),
        ('Carlos Santos', '555.222.111-33', '1978-06-15', 'Rua Central, 45');

INSERT INTO medico (nome, crm, especialidade, data_contratacao, id_departamento)
VALUES  ('Dra. Ana Souza', 'CRM12345', 'Cardiologista', '2020-01-10', 1),
        ('Dr. Pedro Lima', 'CRM67890', 'Pediatra', '2018-07-22', 2),
        ('Dr. Lucas Pereira', 'CRM54321', 'Ortopedista', '2021-03-05', 3);

INSERT INTO consulta (id_paciente, id_medico, data_consulta, duracao_min, diagnostico, observacoes)
VALUES  (1, 1, '2025-11-01', 30, 'Hipertensão controlada', 'Paciente em bom estado.'),
        (2, 2, '2025-11-03', 20, 'Gripe leve', 'Receitado antigripal.'),
        (3, 3, '2025-11-05', 40, 'Dor no joelho', 'Solicitado exame de imagem.');

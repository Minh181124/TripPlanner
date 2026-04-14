--
-- PostgreSQL database dump
--

\restrict fgQl8ooEwWwo8wphSvLpMxeXxqVkg9kcj0qoPqj6ZIhZfc0NtmP1QzeRpiqtjur

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO postgres;

--
-- Name: chitiet_diadiem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.chitiet_diadiem (
    chitiet_diadiem_id integer NOT NULL,
    diadiem_id integer,
    mota_google text,
    mota_tonghop text,
    sodienthoai character varying(20),
    website text,
    giomocua jsonb,
    ngaycapnhat timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.chitiet_diadiem OWNER TO postgres;

--
-- Name: chitiet_diadiem_chitiet_diadiem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.chitiet_diadiem_chitiet_diadiem_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.chitiet_diadiem_chitiet_diadiem_id_seq OWNER TO postgres;

--
-- Name: chitiet_diadiem_chitiet_diadiem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.chitiet_diadiem_chitiet_diadiem_id_seq OWNED BY public.chitiet_diadiem.chitiet_diadiem_id;


--
-- Name: danhgia_diadiem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.danhgia_diadiem (
    danhgia_diadiem_id integer NOT NULL,
    nguoidung_id integer,
    diadiem_id integer,
    sosao integer,
    noidung text,
    ngaytao timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.danhgia_diadiem OWNER TO postgres;

--
-- Name: danhgia_diadiem_danhgia_diadiem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.danhgia_diadiem_danhgia_diadiem_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.danhgia_diadiem_danhgia_diadiem_id_seq OWNER TO postgres;

--
-- Name: danhgia_diadiem_danhgia_diadiem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.danhgia_diadiem_danhgia_diadiem_id_seq OWNED BY public.danhgia_diadiem.danhgia_diadiem_id;


--
-- Name: diadiem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.diadiem (
    diadiem_id integer NOT NULL,
    google_place_id character varying(255) NOT NULL,
    ten character varying(255) NOT NULL,
    diachi text,
    lat double precision,
    lng double precision,
    geom public.geography,
    loai character varying(100),
    danhgia numeric(3,2),
    soluotdanhgia integer,
    giatien integer,
    ngaycapnhat timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    quan_huyen character varying(100),
    tu_khoa text,
    nguoidung_id integer,
    trang_thai character varying(20) DEFAULT 'APPROVED'::character varying
);


ALTER TABLE public.diadiem OWNER TO postgres;

--
-- Name: diadiem_diadiem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.diadiem_diadiem_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.diadiem_diadiem_id_seq OWNER TO postgres;

--
-- Name: diadiem_diadiem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.diadiem_diadiem_id_seq OWNED BY public.diadiem.diadiem_id;


--
-- Name: hinhanh_diadiem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hinhanh_diadiem (
    hinhanh_diadiem_id integer NOT NULL,
    diadiem_id integer,
    photo_reference text,
    url text
);


ALTER TABLE public.hinhanh_diadiem OWNER TO postgres;

--
-- Name: hinhanh_diadiem_hinhanh_diadiem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hinhanh_diadiem_hinhanh_diadiem_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hinhanh_diadiem_hinhanh_diadiem_id_seq OWNER TO postgres;

--
-- Name: hinhanh_diadiem_hinhanh_diadiem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hinhanh_diadiem_hinhanh_diadiem_id_seq OWNED BY public.hinhanh_diadiem.hinhanh_diadiem_id;


--
-- Name: hoatdong_diadiem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.hoatdong_diadiem (
    hoatdong_id integer NOT NULL,
    diadiem_id integer,
    nguoidung_id integer,
    ten_hoatdong character varying(255) NOT NULL,
    noidung_chitiet text,
    loai_hoatdong character varying(50),
    thoidiem_lytuong character varying(100),
    gia_thamkhao numeric(12,2),
    ngaytao timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.hoatdong_diadiem OWNER TO postgres;

--
-- Name: hoatdong_diadiem_hoatdong_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.hoatdong_diadiem_hoatdong_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.hoatdong_diadiem_hoatdong_id_seq OWNER TO postgres;

--
-- Name: hoatdong_diadiem_hoatdong_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.hoatdong_diadiem_hoatdong_id_seq OWNED BY public.hoatdong_diadiem.hoatdong_id;


--
-- Name: lichtrinh_hoatdong; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lichtrinh_hoatdong (
    id integer NOT NULL,
    lichtrinh_nguoidung_id integer NOT NULL,
    hoatdong_id integer NOT NULL,
    da_hoan_thanh boolean DEFAULT false NOT NULL
);


ALTER TABLE public.lichtrinh_hoatdong OWNER TO postgres;

--
-- Name: lichtrinh_hoatdong_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lichtrinh_hoatdong_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lichtrinh_hoatdong_id_seq OWNER TO postgres;

--
-- Name: lichtrinh_hoatdong_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lichtrinh_hoatdong_id_seq OWNED BY public.lichtrinh_hoatdong.id;


--
-- Name: lichtrinh_mau; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lichtrinh_mau (
    lichtrinh_mau_id integer NOT NULL,
    nguoidung_id integer,
    tieude character varying(255) NOT NULL,
    mota text,
    sothich_id integer,
    thoigian_dukien character varying(100),
    luotthich integer DEFAULT 0,
    ngaytao timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    tong_khoangcach numeric,
    tong_thoigian integer
);


ALTER TABLE public.lichtrinh_mau OWNER TO postgres;

--
-- Name: lichtrinh_mau_diadiem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lichtrinh_mau_diadiem (
    id integer NOT NULL,
    lichtrinh_mau_id integer,
    diadiem_id integer,
    thutu integer,
    ngay_thu_may integer DEFAULT 1 NOT NULL,
    thoigian_den time(6) without time zone,
    thoiluong integer,
    ghichu text
);


ALTER TABLE public.lichtrinh_mau_diadiem OWNER TO postgres;

--
-- Name: lichtrinh_mau_diadiem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lichtrinh_mau_diadiem_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lichtrinh_mau_diadiem_id_seq OWNER TO postgres;

--
-- Name: lichtrinh_mau_diadiem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lichtrinh_mau_diadiem_id_seq OWNED BY public.lichtrinh_mau_diadiem.id;


--
-- Name: lichtrinh_mau_lichtrinh_mau_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lichtrinh_mau_lichtrinh_mau_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lichtrinh_mau_lichtrinh_mau_id_seq OWNER TO postgres;

--
-- Name: lichtrinh_mau_lichtrinh_mau_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lichtrinh_mau_lichtrinh_mau_id_seq OWNED BY public.lichtrinh_mau.lichtrinh_mau_id;


--
-- Name: lichtrinh_nguoidung; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lichtrinh_nguoidung (
    lichtrinh_nguoidung_id integer NOT NULL,
    nguoidung_id integer,
    tieude character varying(255) NOT NULL,
    trangthai character varying(50) DEFAULT 'planning'::character varying,
    ngaytao timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    ngaybatdau date,
    ngayketthuc date
);


ALTER TABLE public.lichtrinh_nguoidung OWNER TO postgres;

--
-- Name: lichtrinh_nguoidung_diadiem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lichtrinh_nguoidung_diadiem (
    lichtrinh_nguoidung_id integer,
    diadiem_id integer,
    thutu integer,
    thoigian_den time(6) without time zone,
    thoiluong integer,
    ghichu text,
    id integer NOT NULL,
    ngay_thu_may integer DEFAULT 1 NOT NULL
);


ALTER TABLE public.lichtrinh_nguoidung_diadiem OWNER TO postgres;

--
-- Name: lichtrinh_nguoidung_diadiem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lichtrinh_nguoidung_diadiem_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lichtrinh_nguoidung_diadiem_id_seq OWNER TO postgres;

--
-- Name: lichtrinh_nguoidung_diadiem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lichtrinh_nguoidung_diadiem_id_seq OWNED BY public.lichtrinh_nguoidung_diadiem.id;


--
-- Name: lichtrinh_nguoidung_lichtrinh_nguoidung_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lichtrinh_nguoidung_lichtrinh_nguoidung_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lichtrinh_nguoidung_lichtrinh_nguoidung_id_seq OWNER TO postgres;

--
-- Name: lichtrinh_nguoidung_lichtrinh_nguoidung_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lichtrinh_nguoidung_lichtrinh_nguoidung_id_seq OWNED BY public.lichtrinh_nguoidung.lichtrinh_nguoidung_id;


--
-- Name: lichtrinh_nguoidung_ngay; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.lichtrinh_nguoidung_ngay (
    id integer NOT NULL,
    lichtrinh_nguoidung_id integer NOT NULL,
    ngay_thu_may integer DEFAULT 1 NOT NULL,
    gio_batdau character varying(50),
    diem_batdau_ten character varying(255),
    diem_batdau_lat double precision,
    diem_batdau_lng double precision,
    diem_ketthuc_ten character varying(255),
    diem_ketthuc_lat double precision,
    diem_ketthuc_lng double precision
);


ALTER TABLE public.lichtrinh_nguoidung_ngay OWNER TO postgres;

--
-- Name: lichtrinh_nguoidung_ngay_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.lichtrinh_nguoidung_ngay_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.lichtrinh_nguoidung_ngay_id_seq OWNER TO postgres;

--
-- Name: lichtrinh_nguoidung_ngay_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.lichtrinh_nguoidung_ngay_id_seq OWNED BY public.lichtrinh_nguoidung_ngay.id;


--
-- Name: luu_diadiem; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.luu_diadiem (
    luu_diadiem_id integer NOT NULL,
    nguoidung_id integer,
    diadiem_id integer,
    ngaytao timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.luu_diadiem OWNER TO postgres;

--
-- Name: luu_diadiem_luu_diadiem_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.luu_diadiem_luu_diadiem_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.luu_diadiem_luu_diadiem_id_seq OWNER TO postgres;

--
-- Name: luu_diadiem_luu_diadiem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.luu_diadiem_luu_diadiem_id_seq OWNED BY public.luu_diadiem.luu_diadiem_id;


--
-- Name: nguoidung; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nguoidung (
    nguoidung_id integer NOT NULL,
    email character varying(255) NOT NULL,
    matkhau character varying(255) NOT NULL,
    ten character varying(100),
    avatar text,
    trangthai character varying(50) DEFAULT 'active'::character varying,
    ngaytao timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    ngaycapnhat timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    sdt character varying(20),
    diachi text,
    vaitro character varying(20) DEFAULT 'user'::character varying NOT NULL
);


ALTER TABLE public.nguoidung OWNER TO postgres;

--
-- Name: nguoidung_nguoidung_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nguoidung_nguoidung_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nguoidung_nguoidung_id_seq OWNER TO postgres;

--
-- Name: nguoidung_nguoidung_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nguoidung_nguoidung_id_seq OWNED BY public.nguoidung.nguoidung_id;


--
-- Name: nguoidung_sothich; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.nguoidung_sothich (
    nguoidung_id integer,
    sothich_id integer,
    id integer NOT NULL
);


ALTER TABLE public.nguoidung_sothich OWNER TO postgres;

--
-- Name: nguoidung_sothich_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.nguoidung_sothich_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.nguoidung_sothich_id_seq OWNER TO postgres;

--
-- Name: nguoidung_sothich_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.nguoidung_sothich_id_seq OWNED BY public.nguoidung_sothich.id;


--
-- Name: sothich; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sothich (
    sothich_id integer NOT NULL,
    ten character varying(100) NOT NULL,
    mota text
);


ALTER TABLE public.sothich OWNER TO postgres;

--
-- Name: sothich_sothich_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sothich_sothich_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sothich_sothich_id_seq OWNER TO postgres;

--
-- Name: sothich_sothich_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sothich_sothich_id_seq OWNED BY public.sothich.sothich_id;


--
-- Name: tuyen_duong; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.tuyen_duong (
    tuyen_duong_id integer NOT NULL,
    lichtrinh_nguoidung_id integer,
    polyline text,
    tong_khoangcach numeric,
    tong_thoigian integer,
    ngay_thu_may integer DEFAULT 1 NOT NULL,
    ngaytao timestamp(6) without time zone DEFAULT CURRENT_TIMESTAMP,
    diadiem_batdau_id integer,
    diadiem_ketthuc_id integer,
    phuongtien character varying(50) DEFAULT 'car'::character varying,
    thutu integer,
    lichtrinh_mau_id integer
);


ALTER TABLE public.tuyen_duong OWNER TO postgres;

--
-- Name: tuyen_duong_tuyen_duong_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.tuyen_duong_tuyen_duong_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.tuyen_duong_tuyen_duong_id_seq OWNER TO postgres;

--
-- Name: tuyen_duong_tuyen_duong_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.tuyen_duong_tuyen_duong_id_seq OWNED BY public.tuyen_duong.tuyen_duong_id;


--
-- Name: chitiet_diadiem chitiet_diadiem_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chitiet_diadiem ALTER COLUMN chitiet_diadiem_id SET DEFAULT nextval('public.chitiet_diadiem_chitiet_diadiem_id_seq'::regclass);


--
-- Name: danhgia_diadiem danhgia_diadiem_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danhgia_diadiem ALTER COLUMN danhgia_diadiem_id SET DEFAULT nextval('public.danhgia_diadiem_danhgia_diadiem_id_seq'::regclass);


--
-- Name: diadiem diadiem_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diadiem ALTER COLUMN diadiem_id SET DEFAULT nextval('public.diadiem_diadiem_id_seq'::regclass);


--
-- Name: hinhanh_diadiem hinhanh_diadiem_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hinhanh_diadiem ALTER COLUMN hinhanh_diadiem_id SET DEFAULT nextval('public.hinhanh_diadiem_hinhanh_diadiem_id_seq'::regclass);


--
-- Name: hoatdong_diadiem hoatdong_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoatdong_diadiem ALTER COLUMN hoatdong_id SET DEFAULT nextval('public.hoatdong_diadiem_hoatdong_id_seq'::regclass);


--
-- Name: lichtrinh_hoatdong id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_hoatdong ALTER COLUMN id SET DEFAULT nextval('public.lichtrinh_hoatdong_id_seq'::regclass);


--
-- Name: lichtrinh_mau lichtrinh_mau_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_mau ALTER COLUMN lichtrinh_mau_id SET DEFAULT nextval('public.lichtrinh_mau_lichtrinh_mau_id_seq'::regclass);


--
-- Name: lichtrinh_mau_diadiem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_mau_diadiem ALTER COLUMN id SET DEFAULT nextval('public.lichtrinh_mau_diadiem_id_seq'::regclass);


--
-- Name: lichtrinh_nguoidung lichtrinh_nguoidung_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_nguoidung ALTER COLUMN lichtrinh_nguoidung_id SET DEFAULT nextval('public.lichtrinh_nguoidung_lichtrinh_nguoidung_id_seq'::regclass);


--
-- Name: lichtrinh_nguoidung_diadiem id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_nguoidung_diadiem ALTER COLUMN id SET DEFAULT nextval('public.lichtrinh_nguoidung_diadiem_id_seq'::regclass);


--
-- Name: lichtrinh_nguoidung_ngay id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_nguoidung_ngay ALTER COLUMN id SET DEFAULT nextval('public.lichtrinh_nguoidung_ngay_id_seq'::regclass);


--
-- Name: luu_diadiem luu_diadiem_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.luu_diadiem ALTER COLUMN luu_diadiem_id SET DEFAULT nextval('public.luu_diadiem_luu_diadiem_id_seq'::regclass);


--
-- Name: nguoidung nguoidung_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung ALTER COLUMN nguoidung_id SET DEFAULT nextval('public.nguoidung_nguoidung_id_seq'::regclass);


--
-- Name: nguoidung_sothich id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung_sothich ALTER COLUMN id SET DEFAULT nextval('public.nguoidung_sothich_id_seq'::regclass);


--
-- Name: sothich sothich_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sothich ALTER COLUMN sothich_id SET DEFAULT nextval('public.sothich_sothich_id_seq'::regclass);


--
-- Name: tuyen_duong tuyen_duong_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tuyen_duong ALTER COLUMN tuyen_duong_id SET DEFAULT nextval('public.tuyen_duong_tuyen_duong_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
32b61e0b-7b8a-46ef-b31d-4dc03029129a	a88e6217b325bbc76bc02c18c9ec0af3bb94b3efcbf51d31fa4f9daabca52f57	2026-04-05 16:41:21.138247+07	20260330112849_fix_mapbox_column_length	\N	\N	2026-04-05 16:41:20.739508+07	1
7f49939e-867a-4bf2-b6ec-31b84d62c30a	8fd18ed6233dfab1f174d48d3584c30d77a7761ca0f12a73cc4a8d4ce19ef2f8	2026-04-05 16:41:21.143309+07	20260331111329_init	\N	\N	2026-04-05 16:41:21.138505+07	1
cc68b9c3-ab3d-4807-9921-caa412c17940	c47ec73fd61589cc0a04ade8d9551e3a1192dbfd97d61aa40301397d7d8c677c	2026-04-05 16:41:21.144477+07	20260331143319_add_phuongtien_to_lichtrinh_local	\N	\N	2026-04-05 16:41:21.143551+07	1
192f8520-6006-4955-8ddb-31c6a77821a2	b76afaa6984f98b677b183b4bc977ab47c50a298d64a7d45e8b8b13871e97b38	2026-04-05 16:41:21.145464+07	20260403_add_sdt_diachi_to_nguoidung	\N	\N	2026-04-05 16:41:21.14471+07	1
90ba9443-226d-4dd1-9e94-75fad8a0ee0d	0906a49352411e245e8cb923450db9b6f1f3fbf1de7d75220ce4fd074d8b79b5	2026-04-05 16:41:21.183531+07	20260403043713_init_new_schema_structure	\N	\N	2026-04-05 16:41:21.14575+07	1
7d576fe5-850b-4417-b029-d28a2d9f1df4	39f2c0fc64490b9f466919f927bf615d218247f3a26e4d9aff0f1da6eb1bcd31	2026-04-05 16:41:21.18764+07	20260403055247_add_tuyen_duong_mau	\N	\N	2026-04-05 16:41:21.183807+07	1
f4a2c5a6-42d4-4581-83f5-1b745e45ae80	a3d103ebc13a54977237307d9fc4d58302f84ce1931c49bef00fdc6d9b74776a	2026-04-05 16:41:21.191271+07	20260403060308_consolidate_routes_into_tuyen_duong	\N	\N	2026-04-05 16:41:21.187882+07	1
47972ebc-5b68-4517-826c-5ac3418a0447	83397be41653110412cac52ab30dc8790c9578088f465d7a5b9c239e61a1efc5	2026-04-05 16:41:21.970631+07	20260405094121_k	\N	\N	2026-04-05 16:41:21.96669+07	1
cf9b6477-e953-4f8a-9de6-9f559f0e4155	800722351265d5a2d851a7f32d3168c14d2d41f5e452cc74a07ae4450a92175a	2026-04-07 20:05:56.907122+07	20260407130556_add_lichtrinh_nguoidung_ngay	\N	\N	2026-04-07 20:05:56.846348+07	1
\.


--
-- Data for Name: chitiet_diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chitiet_diadiem (chitiet_diadiem_id, diadiem_id, mota_google, mota_tonghop, sodienthoai, website, giomocua, ngaycapnhat) FROM stdin;
1	1	\N	T├▓a nh├á biß╗âu t╞░ß╗úng h├¼nh b├║p sen cß╗ºa S├ái G├▓n.	\N	https://bitexcofinancialtower.com	\N	2026-04-05 10:01:15.936
2	2	\N	Biß╗âu t╞░ß╗úng c├┤ng gi├ío cß╗ºa th├ánh phß╗æ, kiß║┐n tr├║c Ph├íp cß╗ò.	\N	\N	\N	2026-04-05 10:01:15.938
3	4	qu├ín c├á ph├¬ si├¬u chill	th├¬m chß╗ù n├áy ii admin :D	0987654321	https://www.facebook.com/cafedocla/?locale=vi_VN	\N	2026-04-05 13:03:58.718
8	9	Chuyß║┐n t├áu chß║íy dß╗ìc s├┤ng S├ái G├▓n, ─æi qua c├íc c├┤ng tr├¼nh biß╗âu t╞░ß╗úng nh╞░ Landmark 81, cß║ºu Ba Son.	C├ích rß║╗ nhß║Ñt v├á chill nhß║Ñt ─æß╗â ngß║»m to├án cß║únh khu trung t├óm tß╗½ mß║╖t n╞░ß╗¢c.	1900 63 68 30.	saigonwaterbus.com	\N	2026-04-07 06:08:16.654
9	10	C├┤ng tr├¼nh kiß║┐n tr├║c ti├¬u biß╗âu cß╗ºa nhß╗»ng n─âm 60 vß╗¢i khu├┤n vi├¬n rß╗Öng 12ha ngay trung t├óm.	Biß╗âu t╞░ß╗úng lß╗ïch sß╗¡ kh├┤ng thß╗â bß╗Å qua, kh├┤ng gian cß╗▒c kß╗│ m├ít mß║╗ vß╗¢i h├áng c├óy cß╗ò thß╗Ñ.	028 3822 3652.	https://dinhdoclap.gov.vn/	\N	2026-04-07 06:10:47.469
4	5	M├¼ Cay Seoul chi nh├ính L├¬ V─ân Thß╗ì (G├▓ Vß║Ñp) l├á mß╗Öt qu├ín ─ân chuy├¬n c├íc m├│n m├¼ cay H├án Quß╗æc, nß╗òi bß║¡t vß╗¢i m├┤ h├¼nh ΓÇ£m├¼ cay 7 cß║Ñp ─æß╗ÖΓÇ¥ quen thuß╗Öc nh╞░ng ─æ╞░ß╗úc biß║┐n tß║Ñu ph├╣ hß╗úp khß║⌐u vß╗ï ng╞░ß╗¥i Viß╗çt. Qu├ín tß╗ìa lß║íc tß║íi khu vß╗▒c ─æ├┤ng d├ón c╞░, dß╗à t├¼m, thuß║¡n tiß╗çn cho hß╗ìc sinh ΓÇô sinh vi├¬n v├á d├ón v─ân ph├▓ng. Kh├┤ng gian mang phong c├ích trß║╗ trung, thoß║úi m├íi, ph├╣ hß╗úp ─æi nh├│m bß║ín hoß║╖c ─ân nhanh.\n\nMenu tß║íi ─æ├óy kh├í ─æa dß║íng vß╗¢i c├íc loß║íi m├¼ cay nh╞░ b├▓, hß║úi sß║ún, thß║¡p cß║⌐m, kß║┐t hß╗úp nhiß╗üu topping nh╞░ kim chi, chß║ú c├í, x├║c x├¡ch, nß║ÑmΓÇª N╞░ß╗¢c d├╣ng ─æß║¡m ─æ├á, cay nß╗ông nh╞░ng c├│ thß╗â t├╣y chß╗ënh theo nhiß╗üu cß║Ñp ─æß╗Ö kh├íc nhau, tß╗½ nhß║╣ nh├áng ─æß║┐n ΓÇ£thß╗¡ th├ích vß╗ï gi├ícΓÇ¥. Ngo├ái ra, qu├ín c├▓n phß╗Ñc vß╗Ñ c├íc m├│n ─ân k├¿m v├á ─æß╗ô uß╗æng gi├║p c├ón bß║▒ng vß╗ï cay.	M├¼ Cay Seoul L├¬ V─ân Thß╗ì l├á qu├ín m├¼ cay H├án Quß╗æc nß╗òi bß║¡t tß║íi G├▓ Vß║Ñp vß╗¢i thß╗▒c ─æ╞ín ─æa dß║íng v├á ─æß║╖c tr╞░ng 7 cß║Ñp ─æß╗Ö cay hß║Ñp dß║½n. N╞░ß╗¢c d├╣ng ─æß║¡m vß╗ï, topping phong ph├║, ph├╣ hß╗úp khß║⌐u vß╗ï ng╞░ß╗¥i Viß╗çt. Kh├┤ng gian trß║╗ trung, thoß║úi m├íi, th├¡ch hß╗úp tß╗Ñ tß║¡p bß║ín b├¿ hoß║╖c ─ân nhanh. ─É├óy l├á ─æß╗ïa ─æiß╗âm quen thuß╗Öc cho nhß╗»ng ai y├¬u th├¡ch m├│n m├¼ cay chuß║⌐n vß╗ï H├án nh╞░ng dß╗à ─ân, dß╗à ΓÇ£ghiß╗ünΓÇ¥.	0902 777 600	https://www.facebook.com/micayseoullevantho/?locale=vi_VN	\N	2026-04-07 07:04:05.345
6	7	Galaxy Cinema Nguyß╗àn Du l├á mß╗Öt trong nhß╗»ng rß║íp chiß║┐u phim l├óu ─æß╗¥i v├á nß╗òi tiß║┐ng nhß║Ñt ß╗ƒ trung t├óm TP.HCM. Rß║íp c├│ 5 ph├▓ng chiß║┐u vß╗¢i h╞ín 1000 chß╗ù ngß╗ôi, trang bß╗ï ├óm thanh Dolby 7.1 v├á m├án h├¼nh hiß╗çn ─æß║íi, mang lß║íi trß║úi nghiß╗çm xem phim r├╡ n├⌐t, sß╗æng ─æß╗Öng . Vß╗ï tr├¡ ngay Quß║¡n 1 n├¬n rß║Ñt tiß╗çn kß║┐t hß╗úp ─æi ch╞íi, ─ân uß╗æng tr╞░ß╗¢c hoß║╖c sau khi xem phim.	Galaxy Nguyß╗àn Du l├á rß║íp chiß║┐u phim nß║▒m ß╗ƒ trung t├óm, nß╗òi bß║¡t vß╗¢i gi├í v├⌐ hß╗úp l├╜, chß║Ñt l╞░ß╗úng ß╗òn ─æß╗ïnh v├á kh├┤ng gian rß╗Öng r├úi. ─É├óy l├á ─æß╗ïa ─æiß╗âm quen thuß╗Öc cß╗ºa giß╗¢i trß║╗ nhß╗¥ dß╗à ─æi, nhiß╗üu suß║Ñt chiß║┐u v├á th╞░ß╗¥ng xuy├¬n c├│ ╞░u ─æ├úi.		https://www.galaxycine.vn/	\N	2026-04-07 05:52:48.831
10	11	Qu├ín nß║▒m trong hß║╗m, ngß║¡p tr├án c├óy xanh, b├án ghß║┐ gß╗ù mß╗Öc mß║íc v├á decor rß║Ñt c├│ gu.	Mß╗Öt "ß╗æc ─æß║úo" y├¬n b├¼nh giß╗»a l├▓ng Quß║¡n 3 n├ío nhiß╗çt.	098 716 01 75.	https://www.facebook.com/theseatcafe	\N	2026-04-07 06:19:38.79
11	12	Phß╗Ñc vß╗Ñ c├íc m├│n nh╞░ Nem n╞░ß╗¢ng, b├║n c├í sß╗⌐a, lß║⌐u chua c├í b├│p... tr├¼nh b├áy ─æß║╣p mß║»t.	Kh├┤ng gian sang trß╗ìng nh╞░ng ß║Ñm c├║ng, ph├╣ hß╗úp ─æi gia ─æ├¼nh hoß║╖c tiß║┐p kh├ích.	028 6682 0692.	http://ganhvietnam.com/	\N	2026-04-07 06:21:45.987
12	13	N╞íi tß║¡p trung c├íc th╞░╞íng hiß╗çu quß╗æc tß║┐ v├á khu ß║⌐m thß╗▒c (Food Court) cß╗▒c kß╗│ ─æa dß║íng d╞░ß╗¢i tß║ºng hß║ºm.	TTTM hiß╗çn ─æß║íi v├á sang chß║únh nhß║Ñt S├ái G├▓n hiß╗çn nay.	028 3821 1819.	https://saigoncentre.com.vn/	\N	2026-04-07 06:23:48.058
13	14	Tß╗ìa lß║íc tß║íi 3 tß║ºng cao nhß║Ñt (79, 80, 81) cß╗ºa t├▓a nh├á Landmark 81. Tß║íi ─æ├óy c├│ khu vß╗▒c cß║ºu k├¡nh SkyTouch l╞í lß╗¡ng tr├¬n kh├┤ng trung, khu vß╗▒c c├á ph├¬ sang trß╗ìng v├á c├íc tr├▓ ch╞íi cß║úm gi├íc mß║ính thß╗▒c tß║┐ ß║úo nh╞░ nhß║úy d├╣ tß╗½ ─æß╗ënh t├▓a nh├á.	Mß╗Öt trß║úi nghiß╗çm "chß║ím tß╗¢i m├óy trß╗¥i" thß╗▒c thß╗Ñ. ─É├óy kh├┤ng chß╗ë l├á n╞íi ngß║»m cß║únh m├á c├▓n l├á biß╗âu t╞░ß╗úng cho sß╗▒ ph├ít triß╗ân hiß╗çn ─æß║íi cß╗ºa S├ái G├▓n, n╞íi bß║ín c├│ thß╗â thß║Ñy to├án bß╗Ö hß╗ç thß╗æng s├┤ng ng├▓i v├á c├íc quß║¡n huyß╗çn thu nhß╗Å trong tß║ºm mß║»t.	098 160 16 20	https://vincom.com.vn/vincom-center-landmark-81	\N	2026-04-07 06:27:35.861
14	15	Mß╗Öt t├▓a dinh thß╗▒ cß╗ò k├¡nh x├óy dß╗▒ng theo phong c├ích kiß║┐n tr├║c Ph├íp cuß╗æi thß║┐ kß╗╖ 19 - ─æß║ºu thß║┐ kß╗╖ 20. T├▓a nh├á nß╗òi bß║¡t vß╗¢i m├áu v├áng ─æß║╖c tr╞░ng, nhß╗»ng ├┤ cß╗¡a sß╗ò h├¼nh v├▓m, gß║ích b├┤ng cß╗ò ─æiß╗ân v├á chiß║┐c thang m├íy cß╗ò nhß║Ñt S├ái G├▓n vß║½n c├▓n ─æ╞░ß╗úc bß║úo tß╗ôn.	N╞íi giao thoa giß╗»a gi├í trß╗ï lß╗ïch sß╗¡ v├á h╞íi thß╗ƒ nghß╗ç thuß║¡t ─æ╞░╞íng ─æß║íi. ─É├óy l├á thi├¬n ─æ╞░ß╗¥ng cho nhß╗»ng ai y├¬u th├¡ch phong c├ích Vintage, Retro hoß║╖c muß╗æn t├¼m mß╗Öt g├│c lß║╖ng giß╗»a trung t├óm quß║¡n 1.	028 3829 4441	http://baotangmythuattphcm.com.vn/	\N	2026-04-07 07:03:31.292
7	8	Chiß╗üu Rooftop Beer l├á mß╗Öt rooftop bar nß║▒m ngay trung t├óm, nß╗òi bß║¡t vß╗¢i kh├┤ng gian mß╗ƒ tr├¬n cao, view nh├¼n xuß╗æng th├ánh phß╗æ kh├í ΓÇ£─æ├ú mß║»tΓÇ¥ vß╗ü ─æ├¬m. Qu├ín theo kiß╗âu chill nhß║╣, c├│ bia, cocktail v├á nhß║íc, ph├╣ hß╗úp tß╗Ñ tß║¡p hoß║╖c th╞░ gi├ún sau giß╗¥ l├ám.	Chiß╗üu Rooftop Beer (kiß╗âu Wow Skybar Nguyß╗àn Du) l├á qu├ín rooftop trung t├óm, kh├┤ng gian tho├íng, view ─æß║╣p, vibe chill nhß║╣. Ph├╣ hß╗úp ─æi uß╗æng bia, ngß║»m th├ánh phß╗æ v├á tr├▓ chuyß╗çn h╞ín l├á quß║⌐y mß║ính.	0367 778 478	https://www.facebook.com/chieurooftop/?locale=vi_VN	\N	2026-04-07 07:03:48.653
5	6	AEON Mall T├ón Ph├║ Celadon l├á mß╗Öt trong nhß╗»ng trung t├óm th╞░╞íng mß║íi lß╗¢n v├á hiß╗çn ─æß║íi tß║íi TP.HCM, nß║▒m ß╗ƒ khu Celadon City, quß║¡n T├ón Ph├║. Vß╗¢i quy m├┤ h╞ín 70.000 m┬▓ v├á khoß║úng 200 cß╗¡a h├áng, n╞íi ─æ├óy t├¡ch hß╗úp ─æß║ºy ─æß╗º mua sß║»m, ─ân uß╗æng v├á giß║úi tr├¡ trong c├╣ng mß╗Öt kh├┤ng gian .\n\nTrung t├óm quy tß╗Ñ nhiß╗üu th╞░╞íng hiß╗çu trong v├á ngo├ái n╞░ß╗¢c, khu si├¬u thß╗ï AEON, rß║íp chiß║┐u phim CGV, khu vui ch╞íi trß║╗ em v├á food court ─æa dß║íng tß╗½ m├│n ├ü ─æß║┐n ├éu. Kh├┤ng gian rß╗Öng r├úi, sß║ích sß║╜, mang phong c├ích Nhß║¡t Bß║ún hiß╗çn ─æß║íi, ph├╣ hß╗úp cho cß║ú gia ─æ├¼nh, bß║ín b├¿ v├á c├íc hoß║ít ─æß╗Öng cuß╗æi tuß║ºn	AEON Mall T├ón Ph├║ Celadon l├á trung t├óm mua sß║»m ΓÇô giß║úi tr├¡ quy m├┤ lß╗¢n tß║íi TP.HCM, nß╗òi bß║¡t vß╗¢i kh├┤ng gian hiß╗çn ─æß║íi, ─æa dß║íng cß╗¡a h├áng v├á khu ß║⌐m thß╗▒c phong ph├║. ─É├óy l├á ─æß╗ïa ─æiß╗âm l├╜ t╞░ß╗ƒng ─æß╗â mua sß║»m, ─ân uß╗æng v├á vui ch╞íi cho mß╗ìi lß╗⌐a tuß╗òi, ─æß║╖c biß╗çt v├áo dß╗ïp cuß╗æi tuß║ºn hoß║╖c lß╗à.	028 6288 7733	https://aeonmall-tanphuceladon.com.vn/	\N	2026-04-07 07:03:58.594
15	16	Trß╗Ñc ─æ╞░ß╗¥ng k├⌐o d├ái tß╗½ trß╗Ñ sß╗ƒ UBND Th├ánh phß╗æ ─æß║┐n bß║┐n Bß║ích ─Éß║▒ng. Buß╗òi tß╗æi n╞íi ─æ├óy trß╗ƒ th├ánh quß║úng tr╞░ß╗¥ng lß╗¢n vß╗¢i nhß║íc n╞░ß╗¢c, c├íc nh├│m nghß╗ç s─⌐ tß╗▒ do biß╗âu diß╗àn v├á h├áng chß╗Ñc qu├ín cafe chung c╞░ c┼⌐ nß╗òi tiß║┐ng.	"Tr├íi tim" kh├┤ng ngß╗º cß╗ºa S├ái G├▓n. Nß║┐u muß╗æn biß║┐t ng╞░ß╗¥i trß║╗ S├ái G├▓n ch╞íi g├¼, cß╗⌐ ra ─æ├óy v├áo tß╗æi cuß╗æi tuß║ºn.			\N	2026-04-07 07:06:24.817
\.


--
-- Data for Name: danhgia_diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.danhgia_diadiem (danhgia_diadiem_id, nguoidung_id, diadiem_id, sosao, noidung, ngaytao) FROM stdin;
\.


--
-- Data for Name: diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.diadiem (diadiem_id, google_place_id, ten, diachi, lat, lng, geom, loai, danhgia, soluotdanhgia, giatien, ngaycapnhat, quan_huyen, tu_khoa, nguoidung_id, trang_thai) FROM stdin;
1	mapbox-id-bitexco	T├▓a nh├á Bitexco	2 Hß║úi Triß╗üu, Bß║┐n Ngh├⌐, Quß║¡n 1, TP.HCM	10.7715	106.7042	\N	Tham quan	\N	\N	\N	2026-04-05 10:01:15.933	Quß║¡n 1	ngß║»m cß║únh, t├▓a nh├á, trung t├óm	\N	APPROVED
2	hcm_church_001	Nh├á thß╗¥ ─Éß╗⌐c B├á S├ái G├▓n	01 C├┤ng x├ú Paris, Bß║┐n Ngh├⌐, Quß║¡n 1, TP. Hß╗ô Ch├¡ Minh	10.779785	106.699019	\N	Tham quan	\N	\N	\N	2026-04-05 10:01:15.937	Quß║¡n 1	nh├á thß╗¥, kiß║┐n tr├║c ph├íp, trung t├óm	\N	APPROVED
3	mapbox-id-phobachung	Phß╗ƒ B├á Chung	─É╞░ß╗¥ng Pasteur, Quß║¡n 1, TP.HCM	10.775	106.7	\N	ß║¿m thß╗▒c	\N	\N	\N	2026-04-05 10:01:15.939	Quß║¡n 1	─ân s├íng, phß╗ƒ, truyß╗ün thß╗æng	\N	APPROVED
4	1JZHoWVbczxw1KUvS16Wc_C-UozRfcqxve6CjI3Venut7jaJVXE-doEXbSDQLbZGLRbGgPVeKYcJz1-1U6YKKokXWoRQ	Cafe ─æ├┤╠úc & la╠ú	16 ─É. Sß╗æ 9, Ph╞░ß╗¥ng 16, An Hß╗Öi ─É├┤ng, Hß╗ô Ch├¡ Minh	10.8463543	106.669672	\N	cafe	\N	\N	100000	2026-04-05 13:04:31.485	G├▓ Vß║Ñp	C├á ph├¬, y├¬n t─⌐nh, hß╗ìc b├ái	6	APPROVED
8	Ib5u8PBmL8ZwrnSApVlO7UWuWqGlX7k2QpAYz5dnvUsZvG5NoyiHh32-JbTCWbbbNRqwgTIlYrdYYl2ApsV-1zXC8WQ-8a4COf69ZTY9qj-YZlUoZuWifjxi9QjKPa_TP	Chiß╗üu Rooftop Beer	Chiß╗üu Rooftop Beer, 07 ─É╞░ß╗¥ng Cß╗Öng H├▓a, Ph╞░ß╗¥ng 4, T├ón B├¼nh, Hß╗ô Ch├¡ Minh	10.8006338	106.6601675	\N	restaurant	\N	\N	150000	2026-04-07 07:03:48.652	T├ón B├¼nh	C├á ph├¬, rooftop, bar	6	APPROVED
6	OgdXpEZFRFFupnytJ3ip5UqmUa1DTZ_HUphvtUUQ-PhmtCCBB1qPwXmxQoi-Z7vOZYAogSFOpd5Qn2irtBC9xVe5j2Z4tIhRY6eGhxF3h-B5inUJjYBGXh7G1Soc-EPzH	AEON T├éN PH├Ü	AEON T├éN PH├Ü, Bß╗¥ Bao T├ón Thß║»ng, Celadon City, S╞ín Kß╗│, T├ón Ph├║, Hß╗ô Ch├¡ Minh	10.8011622	106.6173945	\N	store	\N	\N	\N	2026-04-07 07:03:58.592	T├ón Ph├║	Mua sß║»m, trung t├óm th╞░╞íng mß║íi, ─ân uß╗æng	6	APPROVED
5	TUOBblQ0s6NQmW5jqwWahH-yt0xIYJGDUKOGrb-ikft8Ln1-v0S76WOfR2GAQ7_-ZrBUcLdCp4ZriDXpzjmWGoR_KXH9MQ6jJZaH_cVcXgehkm0QXtzyRgWazTBaBOPrB	M├¼ Cay Seoul G├▓ Vß║Ñp - 244 L├¬ V─ân Thß╗ì	M├¼ Cay Seoul G├▓ Vß║Ñp - 244 L├¬ V─ân Thß╗ì, 244 L├¬ V─ân Thß╗ì, Ph╞░ß╗¥ng 11, G├▓ Vß║Ñp, Th├ánh phß╗æ Hß╗ô Ch├¡ Minh	10.8436669	106.6572666	\N	restaurant	\N	\N	100000	2026-04-07 07:04:05.344	G├▓ Vß║Ñp	M├¼ cay, ─æß╗ô H├án, ─ân uß╗æng	6	APPROVED
7	ajBAqYY9p8xgn36ctWSGh1W3aiuvZb_8e5pIBoRqio1iqWoZgBOrzlWcYgS0dbfkZ5thZIUeis1c9pG9Is3aZs1TDWC_sZYa0YTxTpYV1hexgR0ATsxOVhWK3SDiFEv7F	Galaxy Cinema	Galaxy Cinema, 116 Nguyß╗àn Du, Bß║┐n Th├ánh, Quß║¡n 1, Hß╗ô Ch├¡ Minh	10.772975127000052	106.69338383700006	\N		\N	\N	100000	2026-04-07 05:52:48.829	Quß║¡n 1	Xem phim	6	APPROVED
9	Z0YQqXiaUn1IkaxBd1Xk4HW-nlpkkFLldr2fLkqfm91-27MkrJetfWK2rj9SnaH5eNuYGUZ-l9hPgHsDYgqfJfrW9r1xJwIdSe7-fXVpvn_Ymhal6UgmPnwmtnyJSCOTf	S├ái G├▓n waterbus bß║ích ─æß║▒ng	S├ái G├▓n waterbus bß║ích ─æß║▒ng, 10 ─É╞░ß╗¥ng T├┤n ─Éß╗⌐c Thß║»ng, Bß║┐n Ngh├⌐, Quß║¡n 1, Th├ánh phß╗æ Hß╗ô Ch├¡ Minh	10.7745721	106.706293	\N	tourist_attraction	\N	\N	15000	2026-04-07 06:08:16.653	Quß║¡n 1	waterbus s├┤ng S├ái G├▓n, Saigon waterbus	6	APPROVED
10	fURxlVBwpO4AjLlSolnvlnR_mw68Z-rSRYtIFZoCLNVxpFulmWRT4XOpUC-QWLv-d4sBVqtumc9yp26jV16VkmmnUKa8XJnRdLVDPV5Vxlfxlj1ADowOdhXKnWCiVApXV	Di t├¡ch dinh ─Éß╗Öc Lß║¡p	Dinh ─Éß╗Öc Lß║¡p, 135 Nam Kß╗│ Khß╗ƒi Ngh─⌐a, Bß║┐n Th├ánh, Quß║¡n 1, Hß╗ô Ch├¡ Minh	10.777128209000068	106.69540061000004	\N	tourist_attraction	\N	\N	65000	2026-04-07 06:10:47.468	Quß║¡n 1	Dinh ─Éß╗Öc Lß║¡p, Independence Palace	6	APPROVED
11	T5o8tlKsp2Z4qSJCsGG4w3fBUAFkhPr8b0hcnHuNjXRhN2oAtt-r-VWbVD-91ZqSGYZ9cHrJJmfqzp34cVHqK56-fcj2DWI3jYaVTR4V1hexgn0ATsxOVhWK3SDiFEv7F	The Seat Cafe	The Seat Cafe, 491/2 ─É. L├¬ V─ân Sß╗╣, Ph╞░ß╗¥ng 12, Quß║¡n 3, Hß╗ô Ch├¡ Minh	10.78993	106.673713	\N	cafe	\N	\N	75000	2026-04-07 06:19:38.789	Quß║¡n 3	C├á ph├¬, chß╗Ñp ß║únh, l├ám viß╗çc	6	APPROVED
13	jQD1tH6eY3F8m0s9g5JmgE-YcTawT2TYUJhXOKgUrPw7o09lqYrxcgOxVK6zyo7xUw91ooNijoFmml8btUiwT2icxC-FcZEpfZqJUQIJygutnmEcUtBSSgmWwTz-CFfnC	Saigon Centre	Saigon Centre, 65 L├¬ Lß╗úi, Bß║┐n Ngh├⌐, Quß║¡n 1, Hß╗ô Ch├¡ Minh	10.773213043000055	106.70093172600008	\N	store	\N	\N	\N	2026-04-07 06:23:48.057	Quß║¡n 1	Takashimaya, Saigon Centre	6	APPROVED
14	922ShP9cIsqgQbxLvFyQy0ZWUUm_QP_qapWDSowYfORmNYCviRv_-2U-QSu9fGi6jKxaAYtuW0o1wvEkOuhm--3HKQTi7RqLlaKxaTox8jOVplkkauhqcjGu-QTGMG_fM	Landmark 81 skyview	Landmark 81 skyview, Landmark 81, Ph╞░ß╗¥ng 22, B├¼nh Thß║ính, Hß╗ô Ch├¡ Minh	10.794873535000022	106.72186647000007	\N	tourist_attraction	\N	\N	420000	2026-04-07 06:27:35.86	B├¼nh Thß║ính	Landmark 81 SkyView, to├á nh├á cao cß║Ñp nhß║Ñt Viß╗çt Nam	6	APPROVED
15	eXyeY3m0q8hlgmBcuKnuq80p8TRyUDLGah39NOJB5r5B53CFRmA2v-Ze4WThVDlHHoqh6POtSpsBIqE0H43ix4rRlawPnapjkpLhOWphorvF9gl0OiA6YmH-qVSXjD67Y	Bß║úo t├áng Mß╗╣ thuß║¡t	Bß║úo t├áng Mß╗╣ thuß║¡t TP. Hß╗ô Ch├¡ Minh, 97A Ph├│ ─Éß╗⌐c Ch├¡nh, Nguyß╗àn Th├íi B├¼nh, Quß║¡n 1, Hß╗ô Ch├¡ Minh	10.769667426000069	106.69945498400006	\N	tourist_attraction	\N	\N	30000	2026-04-07 07:03:31.291	Quß║¡n 1	Bß║úo t├áng Mß╗╣ thuß║¡t S├ái G├▓n, Fine Arts Museum	6	APPROVED
16	U8aogmuCpEdVxls9she4y2aueTOEYjvdYE7As-bFxHMpmnE-KqXGGJnzGW-m1FbCFtKFYRE9wjeq8vnwPekv9xmCcdQK1T6zkZqJUQIJygutnmEcUY7SSgmWwTz8UFfnC	Phß╗æ ─æi bß╗Ö Nguyß╗àn Huß╗ç	Phß╗æ ─æi bß╗Ö Nguyß╗àn Huß╗ç, Nguyß╗àn Huß╗ç, Bß║┐n Ngh├⌐, Quß║¡n 1, Hß╗ô Ch├¡ Minh	10.774097806000047	106.70363123800007	\N	tourist_attraction	\N	\N	\N	2026-04-07 07:06:24.815	Quß║¡n 1	Phß╗æ ─æi bß╗Ö, c├┤ng vi├¬n bß╗¥ s├┤ng	6	APPROVED
12	VZKDoK_WvJxwvEkz_ka9x3G9YyycRbptXaxVCKLliW9ao0EUMkBu79nGsdAKMUY3wWzVoy4RBushZQU8S_36__mtmYxW2bYzRaKxaTox8hLpplkka5RqMjGu-QTH3G7rM	G├ính - ─Éß║╖c sß║ún Nha Trang	G├ính - ─Éß║╖c sß║ún Nha Trang, 4 Hß║╗m 58 Phß║ím Ngß╗ìc Thß║ích, V├╡ Thß╗ï S├íu, Quß║¡n 3, Hß╗ô Ch├¡ Minh	10.786189610000065	106.69251572900004	\N	restaurant	\N	\N	200000	2026-04-07 13:12:55.842	Quß║¡n 3	Nh├á h├áng G├ính, ─æß║╖c sß║ún Nha Trang	6	APPROVED
\.


--
-- Data for Name: hinhanh_diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hinhanh_diadiem (hinhanh_diadiem_id, diadiem_id, photo_reference, url) FROM stdin;
1	4	\N	https://cdn.xanhsm.com/2025/02/b5bbcfaf-quan-cafe-doc-dao-o-sai-gon-thumb.jpg
12	7	\N	https://cdn.galaxycine.vn/media/2023/10/23/galaxy-nguyen-du-3_1698051874807.jpg
13	7	\N	https://cdn.galaxycine.vn/media/2023/10/23/galaxy-nguyen-du-1_1698051240852.jpg
16	9	\N	https://saigonwaterbus.com/wp-content/uploads/2024/11/z6044714216697_bfdf1a3e573433c20a9fc800b8fd446b.jpg
17	9	\N	https://mia.vn/media/uploads/blog-du-lich/water-bus-1-1692114237.jpg
18	10	\N	https://dinhdoclap.gov.vn/wp-content/uploads/2025/12/luu-nhap-tu-dong-9989.jpg
19	10	\N	https://cdn.tienphong.vn/images/a6bf4f60924201126af6849ca45a3980be8d2779f6bdae6a19cae60030799f5f5ed5ca531af3a4f51399d486bcfca691/4_JWSE.jpg
20	11	\N	https://mia.vn/media/uploads/blog-du-lich/the-seat-cafe-1730098638.jpg
21	11	\N	https://mia.vn/media/uploads/blog-du-lich/the-seat-cafe-menu-1730098638.jpg
22	12	\N	https://pasgo.vn/Upload/anh-chi-tiet/nha-hang-ganh-vinhomes-central-park-9-normal-542682332752.webp
23	12	\N	data:image/jpeg;base64,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
24	13	\N	https://upload.wikimedia.org/wikipedia/commons/b/bd/Saigon_Centre_on_June_17%2C_2017.jpg
25	13	\N	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9TebEGngsqBuWymC2ffxk_nSP3tj_TQ1JKw&s
26	14	\N	https://mia.vn/media/uploads/blog-du-lich/landmark-81-1-1757126973.jpg
27	14	\N	https://bomchuyendung.com/upload/images/the-landmark-la-toa-nha-cao-nhat-viet-nam-va-ca-khu-vuc-dong-nam-a.jpg
28	15	\N	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-CiIKz8CcSBkn6bkS5YheeQtqwSiegQGXFg&s
29	15	\N	https://mia.vn/media/uploads/blog-du-lich/bao-tang-my-thuat-tphcm-010-1692972940.jpg
30	8	\N	https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtqvmqOsbBnHLfUkv0UWa7jfBh8LB3v7Bg6A&s
31	8	\N	https://www.hcmtoplist.com/wp-content/uploads/2022/03/rang-chieu-rooftop-beer-hcmtoplist.jpg
32	6	\N	https://aeonmall-review-rikkei.cdn.vccloud.vn/website/16/settings/March2024/gVWXwdKqUkf2yXez1PKD.jpg
33	6	\N	https://lockernlock.vn/wp-content/uploads/2022/07/aeon-elocker-main.jpg.webp
34	5	\N	https://lh3.googleusercontent.com/geougc-cs/ABOP9puOdVJTjR1-YZHNNT6HrXIr-_K_UUY3uk76v27QpDGjhIjARqTkluhjcPHlgWGjwuL62bPaVSGYZhwaQkpJHiQzXtgYG7ulERTo3oJFgT94vOCh9aiYfRQVw0UDyPH6hpVqoLBbH_m4bBBw=s5104-w5104-h2708-rw
35	5	\N	https://scontent.fsgn5-5.fna.fbcdn.net/v/t39.30808-6/482053878_617033837751268_4568249248033730664_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=7b2446&_nc_ohc=IlxPPOoXrswQ7kNvwG5R6Xc&_nc_oc=Adr_E8n3xzgSHLzxK8dZbfoTviLAf372JxWW5xlaucFENKjjoF9O7lziQrGs_xV7Z30&_nc_zt=23&_nc_ht=scontent.fsgn5-5.fna&_nc_gid=n1jvtWPmKgUHp6Bs6QYZMw&_nc_ss=7a3a8&oh=00_Af3ueBgb4xqwYDGyVUzNongscBE9Bnsb8vRiLieoraV4kA&oe=69DA50FF
36	16	\N	https://cdn.xanhsm.com/2024/11/505d2285-pho-di-bo-nguyen-hue-2.jpg
37	16	\N	https://media-cdn-v2.laodong.vn/Storage/NewsPortal/2021/10/9/961984/Tphcm4.jpg
\.


--
-- Data for Name: hoatdong_diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.hoatdong_diadiem (hoatdong_id, diadiem_id, nguoidung_id, ten_hoatdong, noidung_chitiet, loai_hoatdong, thoidiem_lytuong, gia_thamkhao, ngaytao) FROM stdin;
1	1	7	Ngß║»m S├ái G├▓n tß╗½ Skydeck	Trß║úi nghiß╗çm thang m├íy tß╗æc ─æß╗Ö cao l├¬n tß║ºng 49.	Trß║úi nghiß╗çm	18:00 - 19:00	\N	2026-04-05 10:01:15.94
2	4	6	Uß╗æng c├á ph├¬	qu├ín th├¼ chill, tiß╗ün nong th├¼ kill	Uß╗æng c├á ph├¬	s├íng tr╞░a chiß╗üu	69000.00	2026-04-05 13:03:58.724
5	7	6	Xem phim	─Éi rß║íp n├áy cß║úm gi├íc kh├í ΓÇ£classicΓÇ¥ nh╞░ng vß║½n ß╗òn ├íp, kh├┤ng qu├í sang nh╞░ng xem phim rß║Ñt ok\nN├¬n ─æß║╖t v├⌐ tr╞░ß╗¢c, v├¼ phim hot dß╗à hß║┐t v├⌐ v├á rß║íp kh├í ─æ├┤ng\n─Éi sß╗¢m ch├║t ─æß╗â mua bß║»p n╞░ß╗¢c, v├¼ giß╗¥ cao ─æiß╗âm xß║┐p h├áng kh├í l├óu\nNß║┐u ─æi hß║╣n h├▓ th├¼ c├│ thß╗â chß╗ìn ghß║┐ ─æ├┤i ph├¡a sau, kh├í ri├¬ng t╞░\nV├⌐ ß╗ƒ ─æ├óy nh├¼n chung mß╗üm h╞ín nhiß╗üu rß║íp kh├íc, ─æß║╖c biß╗çt l├á ng├áy th╞░ß╗¥ng hoß║╖c ╞░u ─æ├úi\nTß╗òng thß╗â: ph├╣ hß╗úp nß║┐u bß║ín cß║ºn mß╗Öt rß║íp gi├í tß╗æt, dß╗à ─æi, xem ß╗òn ─æß╗ïnh, kh├┤ng cß║ºn qu├í ΓÇ£xß╗ïn s├▓ΓÇ¥ nh╞░ng vß║½n ─æß╗º trß║úi nghiß╗çm 	xem phim	Tr╞░a, chiß╗üu, tß╗æi	100000.00	2026-04-07 05:52:48.834
7	9	6	Ngß║»m cß║únh s├┤ng S├ái G├▓n tr├¬n t├áu si├¬u tß╗æc	N├¬n ─æi v├áo l├║c 16h30 - 17h30 ─æß╗â ngß║»m ho├áng h├┤n v├á l├║c th├ánh phß╗æ l├¬n ─æ├¿n\nN├¬n ─æß║╖t v├⌐ online tr╞░ß╗¢c ├¡t nhß║Ñt 1-2 ng├áy nß║┐u ─æi cuß╗æi tuß║ºn v├¼ rß║Ñt nhanh hß║┐t v├⌐ ─æß║╣p.	Check-in, ngß║»m cß║únh, ─æi t├áu	Buß╗òi chiß╗üu tß╗½ 16h30 - 17h30	15000.00	2026-04-07 06:08:16.658
8	10	6	Tham quan kiß║┐n tr├║c, t├¼m hiß╗âu lß╗ïch sß╗¡	N├¬n ─æi v├áo buß╗òi s├íng tß╗½ 8h - 10h ─æß╗â tr├ính nß║»ng n├│ng\nN├¬n thu├¬ tai nghe thuyß║┐t minh tß╗▒ ─æß╗Öng (audio guide) ─æß╗â hiß╗âu hß║┐t ├╜ ngh─⌐a c├íc ph├▓ng v├á sß╗▒ kiß╗çn lß╗ïch sß╗¡.	Check-in, tham quan Dinh ─Éß╗Öc Lß║¡p	S├íng sß╗¢m tß╗½ 8h - 10h	65000.00	2026-04-07 06:10:47.472
9	11	6	Th╞░ß╗ƒng thß╗⌐c cafe, chß╗Ñp h├¼nh sß╗æng ß║úo	N├¬n ─æi v├áo nhß╗»ng ng├áy buß╗òi s├íng nß║»ng xi├¬n qua l├í, rß║Ñt ─æß║╣p ─æß╗â chß╗Ñp h├¼nh\nQu├ín c├│ nhiß╗üu g├│c nhß╗Å ri├¬ng t╞░, rß║Ñt hß╗úp cho c├íc cß║╖p ─æ├┤i hoß║╖c ng╞░ß╗¥i muß╗æn tß║¡p trung l├ám viß╗çc.	C├á ph├¬, chß╗Ñp ß║únh	Buß╗òi s├íng 	75000.00	2026-04-07 06:19:38.793
10	12	6	Th╞░ß╗ƒng thß╗⌐c ß║⌐m thß╗▒c miß╗ün Trung	M├│n "Nem n╞░ß╗¢ng Nha Trang" ß╗ƒ ─æ├óy l├á ─æß║╖c sß║ún nhß║Ñt ─æß╗ïnh phß║úi thß╗¡. N├¬n ─æß║╖t b├án tr╞░ß╗¢c v├áo cuß╗æi tuß║ºn.	ß║¿m thß╗▒c	Bß╗»a tr╞░a hoß║╖c bß╗»a tß╗æi	200000.00	2026-04-07 06:21:45.992
11	13	6	Mua sß║»m, ─ân uß╗æng	Khu vß╗▒c sß║únh ch├¡nh th╞░ß╗¥ng c├│ c├íc cß╗Ñm trang tr├¡ theo m├╣a (Trung thu, Gi├íng sinh, Tß║┐t) rß║Ñt ho├ánh tr├íng ─æß╗â chß╗Ñp ß║únh.	Check-in, ß║⌐m thß╗▒c, mua sß║»m	Cß║ú ng├áy	100000.00	2026-04-07 06:23:48.061
12	14	6	Ngß║»m to├án cß║únh th├ánh phß╗æ	─Éß╗½ng chß╗ë l├¬n ngß║»m cß║únh rß╗ôi vß╗ü, h├úy d├ánh thß╗¥i gian check-in tß║íi khu vß╗▒c ghß║┐ ngß╗ôi s├ít k├¡nh ─æß╗â c├│ nhß╗»ng bß╗⌐c ß║únh "v├┤ thß╗▒c".\n\nNß║┐u bß║ín thß║Ñy v├⌐ l├¬n SkyView qu├í cao, mß╗Öt mß║╣o nhß╗Å l├á c├│ thß╗â v├áo c├íc qu├ín cafe/bar ß╗ƒ tß║ºng 75-76 (nh╞░ Blank Lounge). Gi├í mß╗Öt ly n╞░ß╗¢c khoß║úng 200k-300k, tuy thß║Ñp h╞ín v├ái tß║ºng nh╞░ng vß║½n ─æß╗º ─æß╗â ngß║»m cß║únh v├á kh├┤ng gian rß║Ñt chill.\n\nNhß╗¢ kiß╗âm tra thß╗¥i tiß║┐t tr╞░ß╗¢c khi ─æi; nß║┐u trß╗¥i qu├í m├╣ hoß║╖c m╞░a lß╗¢n, tß║ºm nh├¼n sß║╜ bß╗ï hß║ín chß║┐ rß║Ñt nhiß╗üu.	Check-in, ngß║»m cß║únh	Buß╗òi chiß╗üu 17h - 18h30	420000.00	2026-04-07 06:27:35.864
13	15	6	Chß╗Ñp ß║únh nghß╗ç thuß║¡t	Bß║úo t├áng c├│ 3 t├▓a nh├á kh├íc nhau, t├▓a ch├¡nh giß╗»a l├á n╞íi c├│ nhiß╗üu g├│c chß╗Ñp ß║únh ─æß║╣p nhß║Ñt.\n\nL╞░u ├╜ quan trß╗ìng: Nß║┐u bß║ín mang theo m├íy ß║únh c╞í (DSLR), bß║úo t├áng sß║╜ thu th├¬m ph├¡ chß╗Ñp h├¼nh (kh├í cao). Nß║┐u chß╗ë d├╣ng ─æiß╗çn thoß║íi th├¼ ho├án to├án miß╗àn ph├¡.\n\nTrang phß╗Ñc: N├¬n mß║╖c ─æß╗ô c├│ m├áu trß║»ng, be hoß║╖c c├íc t├┤ng m├áu nß╗òi bß║¡t (─æß╗Å, xanh ─æß║¡m) ─æß╗â t╞░╞íng phß║ún vß╗¢i nß╗ün t╞░ß╗¥ng v├áng cß╗ò ─æiß╗ân cß╗ºa bß║úo t├áng.	Check-in, tham quan	Buß╗òi s├íng 9h - 11h	30000.00	2026-04-07 07:03:31.295
14	8	6	Chß╗Ñp h├¼nh rooftop, bar	─Éi tß║ºm chiß╗üu tß╗æi ΓÇô ho├áng h├┤n l├á ─æß║╣p nhß║Ñt, l├║c n├áy l├¬n ─æ├¿n nh├¼n rß║Ñt chill\nNgß╗ôi ngo├ái trß╗¥i sß║╜ ─æ├íng tiß╗ün h╞ín trong nh├á v├¼ c├│ gi├│ v├á view\nGi├í ─æß╗ô uß╗æng h╞íi cao h╞ín qu├ín b├¼nh th╞░ß╗¥ng, nh╞░ng ─æß╗òi lß║íi l├á kh├┤ng gian\nNß║┐u ─æi cuß╗æi tuß║ºn n├¬n ─æi sß╗¢m hoß║╖c ─æß║╖t chß╗ù tr╞░ß╗¢c v├¼ dß╗à ─æ├┤ng\n\nTß╗òng thß╗â: hß╗úp ─æß╗â chill nhß║╣, ngß║»m view, n├│i chuyß╗çn, kh├┤ng qu├í ß╗ôn ├áo nh╞░ng vß║½n c├│ kh├┤ng kh├¡ vß╗ü ─æ├¬m kh├í cuß╗æn	Check-in, bar, c├á ph├¬	Buß╗òi chiß╗üu tß╗½ 17h - 22h	\N	2026-04-07 07:03:48.658
15	6	6	─Éi dß║ío trong trung t├óm th╞░╞íng mß║íi	N├¬n ─æi tß║ºm tr╞░a hoß║╖c chiß╗üu cho ─æß╗í ─æ├┤ng\nNß║┐u ─ân uß╗æng th├¼ cß╗⌐ v├áo food court cho dß╗à chß╗ìn\nSi├¬u thß╗ï buß╗òi tß╗æi hay c├│ ─æß╗ô giß║úm gi├í, ─æ├íng thß╗¡\n\nTß╗òng thß╗â: hß╗úp ─æß╗â ─æi ch╞íi nhß║╣ nh├áng, ─ân uß╗æng, xem phim; kiß╗âu ─æi mß╗Öt v├▓ng l├á hß║┐t cß║ú buß╗òi m├á kh├┤ng ch├ín	Check-in, all-in-one	Cß║ú ng├áy	\N	2026-04-07 07:03:58.598
16	5	6	th╞░ß╗ƒng thß╗⌐c m├¼ cay	N├¬n chß╗ìn cß║Ñp ─æß╗Ö cay vß╗½a phß║úi ─æß╗â th╞░ß╗ƒng thß╗⌐c trß╗ìn vß╗ï, tr├ính qu├í cay g├óy ΓÇ£─æuß╗æiΓÇ¥.\n─én chß║¡m, kß║┐t hß╗úp topping gi├║p c├ón bß║▒ng vß╗ï cay.\n─Éi nh├│m sß║╜ vui h╞ín v├¼ c├│ thß╗â ΓÇ£thß╗¡ th├ích ─ân cayΓÇ¥.\nN├¬n ─æi sß╗¢m hoß║╖c tr├ính giß╗¥ tß╗æi cao ─æiß╗âm ─æß╗â kh├┤ng phß║úi chß╗¥ l├óu.	ß║¿m thß╗▒c, ─æß╗ô H├án	Buß╗òi chiß╗üu tß╗½ 15h - 20h	\N	2026-04-07 07:04:05.349
17	16	6	─Éi dß║ío, xem biß╗âu diß╗àn nghß╗ç thuß║¡t ─æ╞░ß╗¥ng phß╗æ	Gß╗¡i xe: Tr├ính gß╗¡i ß╗ƒ c├íc b├úi tß╗▒ ph├ít ven ─æ╞░ß╗¥ng vß╗¢i gi├í "cß║»t cß╗ò". H├úy v├áo hß║ºm xe cß╗ºa c├íc t├▓a nh├á quanh ─æ├│ nh╞░ Bitexco, Saigon Centre hoß║╖c hß║ºm xe cß╗ºa phß╗æ ─æi bß╗Ö d╞░ß╗¢i ch├ón kh├ích sß║ín Rex.\n\n─én uß╗æng: ─Éß╗½ng bß╗Å qua "Thi├¬n ─æ╞░ß╗¥ng cafe chung c╞░" tß║íi sß╗æ 42 Nguyß╗àn Huß╗ç. Mß╗ùi c─ân hß╗Ö l├á mß╗Öt qu├ín cafe vß╗¢i phong c├ích ri├¬ng biß╗çt.\n\nTß╗½ phß╗æ ─æi bß╗Ö, bß║ín chß╗ë cß║ºn b─âng qua ─æ╞░ß╗¥ng l├á tß╗¢i C├┤ng vi├¬n bß║┐n Bß║ích ─Éß║▒ng mß╗¢i ─æ╞░ß╗úc n├óng cß║Ñp cß╗▒c ─æß║╣p, rß║Ñt tho├íng m├ít ─æß╗â ngß╗ôi ngß║»m t├áu thuyß╗ün chß║íy tr├¬n s├┤ng.	check-in, ─æi dß║ío, ─ân vß║╖t, h├│ng gi├│	Buß╗òi tß╗æi sau 19h	\N	2026-04-07 07:06:24.819
\.


--
-- Data for Name: lichtrinh_hoatdong; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lichtrinh_hoatdong (id, lichtrinh_nguoidung_id, hoatdong_id, da_hoan_thanh) FROM stdin;
1	1	1	f
\.


--
-- Data for Name: lichtrinh_mau; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lichtrinh_mau (lichtrinh_mau_id, nguoidung_id, tieude, mota, sothich_id, thoigian_dukien, luotthich, ngaytao, tong_khoangcach, tong_thoigian) FROM stdin;
1	7	S├ái G├▓n kiß║┐n tr├║c & ├ính ─æ├¿n	Kh├ím ph├í c├íc biß╗âu t╞░ß╗úng cß╗ºa Quß║¡n 1	1	1 ng├áy	0	2026-04-05 10:01:15.942	\N	\N
\.


--
-- Data for Name: lichtrinh_mau_diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lichtrinh_mau_diadiem (id, lichtrinh_mau_id, diadiem_id, thutu, ngay_thu_may, thoigian_den, thoiluong, ghichu) FROM stdin;
1	1	3	1	1	\N	\N	─én s├íng nß║íp n─âng l╞░ß╗úng.
2	1	1	2	1	\N	\N	Tham quan t├▓a nh├á biß╗âu t╞░ß╗úng.
\.


--
-- Data for Name: lichtrinh_nguoidung; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lichtrinh_nguoidung (lichtrinh_nguoidung_id, nguoidung_id, tieude, trangthai, ngaytao, ngaybatdau, ngayketthuc) FROM stdin;
1	8	Du lß╗ïch lß╗à 30/04	planning	2026-04-05 10:01:15.949	2026-04-30	2026-05-02
2	8	hmk	planning	2026-04-07 13:12:55.851	\N	\N
\.


--
-- Data for Name: lichtrinh_nguoidung_diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lichtrinh_nguoidung_diadiem (lichtrinh_nguoidung_id, diadiem_id, thutu, thoigian_den, thoiluong, ghichu, id, ngay_thu_may) FROM stdin;
1	3	1	\N	\N	\N	1	1
2	12	1	08:10:00	60	\N	2	1
\.


--
-- Data for Name: lichtrinh_nguoidung_ngay; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lichtrinh_nguoidung_ngay (id, lichtrinh_nguoidung_id, ngay_thu_may, gio_batdau, diem_batdau_ten, diem_batdau_lat, diem_batdau_lng, diem_ketthuc_ten, diem_ketthuc_lat, diem_ketthuc_lng) FROM stdin;
1	2	1	08:00	M Village	10.78836644100005	106.67638642600008	Nh├á thß╗¥ ─Éß╗⌐c B├á	20.424540080000043	106.17770842500005
\.


--
-- Data for Name: luu_diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.luu_diadiem (luu_diadiem_id, nguoidung_id, diadiem_id, ngaytao) FROM stdin;
\.


--
-- Data for Name: nguoidung; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nguoidung (nguoidung_id, email, matkhau, ten, avatar, trangthai, ngaytao, ngaycapnhat, sdt, diachi, vaitro) FROM stdin;
6	admin@travel.com	$2b$10$kbkg5sT6SKRYJatvrNqtFe3Ej2mpH6tkDa.tv7cN2RY8Tk87vCZQK	Quß║ún trß╗ï vi├¬n	\N	active	2026-04-05 10:01:15.924	2026-04-05 10:01:15.924	\N	\N	admin
7	local@travel.com	$2b$10$kbkg5sT6SKRYJatvrNqtFe3Ej2mpH6tkDa.tv7cN2RY8Tk87vCZQK	Minh Local Guide	\N	active	2026-04-05 10:01:15.928	2026-04-05 10:01:15.928	\N	\N	local
8	user@travel.com	$2b$10$kbkg5sT6SKRYJatvrNqtFe3Ej2mpH6tkDa.tv7cN2RY8Tk87vCZQK	Kh├ích du lß╗ïch	\N	active	2026-04-05 10:01:15.929	2026-04-05 10:01:15.929	\N	\N	user
\.


--
-- Data for Name: nguoidung_sothich; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.nguoidung_sothich (nguoidung_id, sothich_id, id) FROM stdin;
\.


--
-- Data for Name: sothich; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sothich (sothich_id, ten, mota) FROM stdin;
1	Chill	Th╞░ gi├ún, nhß║╣ nh├áng
2	ß║¿m thß╗▒c	Kh├ím ph├í ─æß╗ô ─ân ─æß╗ïa ph╞░╞íng
3	Lß╗ïch sß╗¡	Bß║úo t├áng, di t├¡ch
\.


--
-- Data for Name: spatial_ref_sys; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.spatial_ref_sys (srid, auth_name, auth_srid, srtext, proj4text) FROM stdin;
\.


--
-- Data for Name: tuyen_duong; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.tuyen_duong (tuyen_duong_id, lichtrinh_nguoidung_id, polyline, tong_khoangcach, tong_thoigian, ngay_thu_may, ngaytao, diadiem_batdau_id, diadiem_ketthuc_id, phuongtien, thutu, lichtrinh_mau_id) FROM stdin;
1	1	e~p`Akv_jS_C?_C?uD?yD?	1200	420	1	2026-04-05 10:01:15.953	3	1	bike	\N	\N
\.


--
-- Name: chitiet_diadiem_chitiet_diadiem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.chitiet_diadiem_chitiet_diadiem_id_seq', 15, true);


--
-- Name: danhgia_diadiem_danhgia_diadiem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.danhgia_diadiem_danhgia_diadiem_id_seq', 1, false);


--
-- Name: diadiem_diadiem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.diadiem_diadiem_id_seq', 17, true);


--
-- Name: hinhanh_diadiem_hinhanh_diadiem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hinhanh_diadiem_hinhanh_diadiem_id_seq', 37, true);


--
-- Name: hoatdong_diadiem_hoatdong_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.hoatdong_diadiem_hoatdong_id_seq', 17, true);


--
-- Name: lichtrinh_hoatdong_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lichtrinh_hoatdong_id_seq', 1, true);


--
-- Name: lichtrinh_mau_diadiem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lichtrinh_mau_diadiem_id_seq', 2, true);


--
-- Name: lichtrinh_mau_lichtrinh_mau_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lichtrinh_mau_lichtrinh_mau_id_seq', 1, true);


--
-- Name: lichtrinh_nguoidung_diadiem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lichtrinh_nguoidung_diadiem_id_seq', 2, true);


--
-- Name: lichtrinh_nguoidung_lichtrinh_nguoidung_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lichtrinh_nguoidung_lichtrinh_nguoidung_id_seq', 2, true);


--
-- Name: lichtrinh_nguoidung_ngay_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lichtrinh_nguoidung_ngay_id_seq', 1, true);


--
-- Name: luu_diadiem_luu_diadiem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.luu_diadiem_luu_diadiem_id_seq', 1, false);


--
-- Name: nguoidung_nguoidung_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nguoidung_nguoidung_id_seq', 8, true);


--
-- Name: nguoidung_sothich_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.nguoidung_sothich_id_seq', 1, false);


--
-- Name: sothich_sothich_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sothich_sothich_id_seq', 3, true);


--
-- Name: tuyen_duong_tuyen_duong_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.tuyen_duong_tuyen_duong_id_seq', 1, true);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: chitiet_diadiem chitiet_diadiem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chitiet_diadiem
    ADD CONSTRAINT chitiet_diadiem_pkey PRIMARY KEY (chitiet_diadiem_id);


--
-- Name: danhgia_diadiem danhgia_diadiem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danhgia_diadiem
    ADD CONSTRAINT danhgia_diadiem_pkey PRIMARY KEY (danhgia_diadiem_id);


--
-- Name: diadiem diadiem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diadiem
    ADD CONSTRAINT diadiem_pkey PRIMARY KEY (diadiem_id);


--
-- Name: hinhanh_diadiem hinhanh_diadiem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hinhanh_diadiem
    ADD CONSTRAINT hinhanh_diadiem_pkey PRIMARY KEY (hinhanh_diadiem_id);


--
-- Name: hoatdong_diadiem hoatdong_diadiem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoatdong_diadiem
    ADD CONSTRAINT hoatdong_diadiem_pkey PRIMARY KEY (hoatdong_id);


--
-- Name: lichtrinh_hoatdong lichtrinh_hoatdong_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_hoatdong
    ADD CONSTRAINT lichtrinh_hoatdong_pkey PRIMARY KEY (id);


--
-- Name: lichtrinh_mau_diadiem lichtrinh_mau_diadiem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_mau_diadiem
    ADD CONSTRAINT lichtrinh_mau_diadiem_pkey PRIMARY KEY (id);


--
-- Name: lichtrinh_mau lichtrinh_mau_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_mau
    ADD CONSTRAINT lichtrinh_mau_pkey PRIMARY KEY (lichtrinh_mau_id);


--
-- Name: lichtrinh_nguoidung_diadiem lichtrinh_nguoidung_diadiem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_nguoidung_diadiem
    ADD CONSTRAINT lichtrinh_nguoidung_diadiem_pkey PRIMARY KEY (id);


--
-- Name: lichtrinh_nguoidung_ngay lichtrinh_nguoidung_ngay_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_nguoidung_ngay
    ADD CONSTRAINT lichtrinh_nguoidung_ngay_pkey PRIMARY KEY (id);


--
-- Name: lichtrinh_nguoidung lichtrinh_nguoidung_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_nguoidung
    ADD CONSTRAINT lichtrinh_nguoidung_pkey PRIMARY KEY (lichtrinh_nguoidung_id);


--
-- Name: luu_diadiem luu_diadiem_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.luu_diadiem
    ADD CONSTRAINT luu_diadiem_pkey PRIMARY KEY (luu_diadiem_id);


--
-- Name: nguoidung nguoidung_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung
    ADD CONSTRAINT nguoidung_pkey PRIMARY KEY (nguoidung_id);


--
-- Name: nguoidung_sothich nguoidung_sothich_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung_sothich
    ADD CONSTRAINT nguoidung_sothich_pkey PRIMARY KEY (id);


--
-- Name: sothich sothich_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sothich
    ADD CONSTRAINT sothich_pkey PRIMARY KEY (sothich_id);


--
-- Name: tuyen_duong tuyen_duong_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tuyen_duong
    ADD CONSTRAINT tuyen_duong_pkey PRIMARY KEY (tuyen_duong_id);


--
-- Name: diadiem_google_place_id_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX diadiem_google_place_id_key ON public.diadiem USING btree (google_place_id);


--
-- Name: nguoidung_email_key; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX nguoidung_email_key ON public.nguoidung USING btree (email);


--
-- Name: chitiet_diadiem chitiet_diadiem_diadiem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.chitiet_diadiem
    ADD CONSTRAINT chitiet_diadiem_diadiem_id_fkey FOREIGN KEY (diadiem_id) REFERENCES public.diadiem(diadiem_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: danhgia_diadiem danhgia_diadiem_diadiem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danhgia_diadiem
    ADD CONSTRAINT danhgia_diadiem_diadiem_id_fkey FOREIGN KEY (diadiem_id) REFERENCES public.diadiem(diadiem_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: danhgia_diadiem danhgia_diadiem_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.danhgia_diadiem
    ADD CONSTRAINT danhgia_diadiem_nguoidung_id_fkey FOREIGN KEY (nguoidung_id) REFERENCES public.nguoidung(nguoidung_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: diadiem diadiem_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.diadiem
    ADD CONSTRAINT diadiem_nguoidung_id_fkey FOREIGN KEY (nguoidung_id) REFERENCES public.nguoidung(nguoidung_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: hinhanh_diadiem hinhanh_diadiem_diadiem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hinhanh_diadiem
    ADD CONSTRAINT hinhanh_diadiem_diadiem_id_fkey FOREIGN KEY (diadiem_id) REFERENCES public.diadiem(diadiem_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hoatdong_diadiem hoatdong_diadiem_diadiem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoatdong_diadiem
    ADD CONSTRAINT hoatdong_diadiem_diadiem_id_fkey FOREIGN KEY (diadiem_id) REFERENCES public.diadiem(diadiem_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: hoatdong_diadiem hoatdong_diadiem_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.hoatdong_diadiem
    ADD CONSTRAINT hoatdong_diadiem_nguoidung_id_fkey FOREIGN KEY (nguoidung_id) REFERENCES public.nguoidung(nguoidung_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lichtrinh_hoatdong lichtrinh_hoatdong_hoatdong_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_hoatdong
    ADD CONSTRAINT lichtrinh_hoatdong_hoatdong_id_fkey FOREIGN KEY (hoatdong_id) REFERENCES public.hoatdong_diadiem(hoatdong_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lichtrinh_hoatdong lichtrinh_hoatdong_lichtrinh_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_hoatdong
    ADD CONSTRAINT lichtrinh_hoatdong_lichtrinh_nguoidung_id_fkey FOREIGN KEY (lichtrinh_nguoidung_id) REFERENCES public.lichtrinh_nguoidung(lichtrinh_nguoidung_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lichtrinh_mau_diadiem lichtrinh_mau_diadiem_diadiem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_mau_diadiem
    ADD CONSTRAINT lichtrinh_mau_diadiem_diadiem_id_fkey FOREIGN KEY (diadiem_id) REFERENCES public.diadiem(diadiem_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lichtrinh_mau_diadiem lichtrinh_mau_diadiem_lichtrinh_mau_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_mau_diadiem
    ADD CONSTRAINT lichtrinh_mau_diadiem_lichtrinh_mau_id_fkey FOREIGN KEY (lichtrinh_mau_id) REFERENCES public.lichtrinh_mau(lichtrinh_mau_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lichtrinh_mau lichtrinh_mau_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_mau
    ADD CONSTRAINT lichtrinh_mau_nguoidung_id_fkey FOREIGN KEY (nguoidung_id) REFERENCES public.nguoidung(nguoidung_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lichtrinh_mau lichtrinh_mau_sothich_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_mau
    ADD CONSTRAINT lichtrinh_mau_sothich_id_fkey FOREIGN KEY (sothich_id) REFERENCES public.sothich(sothich_id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: lichtrinh_nguoidung_diadiem lichtrinh_nguoidung_diadiem_diadiem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_nguoidung_diadiem
    ADD CONSTRAINT lichtrinh_nguoidung_diadiem_diadiem_id_fkey FOREIGN KEY (diadiem_id) REFERENCES public.diadiem(diadiem_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lichtrinh_nguoidung_diadiem lichtrinh_nguoidung_diadiem_lichtrinh_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_nguoidung_diadiem
    ADD CONSTRAINT lichtrinh_nguoidung_diadiem_lichtrinh_nguoidung_id_fkey FOREIGN KEY (lichtrinh_nguoidung_id) REFERENCES public.lichtrinh_nguoidung(lichtrinh_nguoidung_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lichtrinh_nguoidung_ngay lichtrinh_nguoidung_ngay_lichtrinh_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_nguoidung_ngay
    ADD CONSTRAINT lichtrinh_nguoidung_ngay_lichtrinh_nguoidung_id_fkey FOREIGN KEY (lichtrinh_nguoidung_id) REFERENCES public.lichtrinh_nguoidung(lichtrinh_nguoidung_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: lichtrinh_nguoidung lichtrinh_nguoidung_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.lichtrinh_nguoidung
    ADD CONSTRAINT lichtrinh_nguoidung_nguoidung_id_fkey FOREIGN KEY (nguoidung_id) REFERENCES public.nguoidung(nguoidung_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: luu_diadiem luu_diadiem_diadiem_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.luu_diadiem
    ADD CONSTRAINT luu_diadiem_diadiem_id_fkey FOREIGN KEY (diadiem_id) REFERENCES public.diadiem(diadiem_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: luu_diadiem luu_diadiem_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.luu_diadiem
    ADD CONSTRAINT luu_diadiem_nguoidung_id_fkey FOREIGN KEY (nguoidung_id) REFERENCES public.nguoidung(nguoidung_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nguoidung_sothich nguoidung_sothich_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung_sothich
    ADD CONSTRAINT nguoidung_sothich_nguoidung_id_fkey FOREIGN KEY (nguoidung_id) REFERENCES public.nguoidung(nguoidung_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: nguoidung_sothich nguoidung_sothich_sothich_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.nguoidung_sothich
    ADD CONSTRAINT nguoidung_sothich_sothich_id_fkey FOREIGN KEY (sothich_id) REFERENCES public.sothich(sothich_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tuyen_duong tuyen_duong_lichtrinh_mau_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tuyen_duong
    ADD CONSTRAINT tuyen_duong_lichtrinh_mau_id_fkey FOREIGN KEY (lichtrinh_mau_id) REFERENCES public.lichtrinh_mau(lichtrinh_mau_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: tuyen_duong tuyen_duong_lichtrinh_nguoidung_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.tuyen_duong
    ADD CONSTRAINT tuyen_duong_lichtrinh_nguoidung_id_fkey FOREIGN KEY (lichtrinh_nguoidung_id) REFERENCES public.lichtrinh_nguoidung(lichtrinh_nguoidung_id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict fgQl8ooEwWwo8wphSvLpMxeXxqVkg9kcj0qoPqj6ZIhZfc0NtmP1QzeRpiqtjur


--
-- PostgreSQL database dump
--

\restrict vHHoAaGMUzEchicLmJk39g4solLLvsrQCE8RGymEBDTsXY5pa87sguc89mqHBYv

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
\.


--
-- Data for Name: chitiet_diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.chitiet_diadiem (chitiet_diadiem_id, diadiem_id, mota_google, mota_tonghop, sodienthoai, website, giomocua, ngaycapnhat) FROM stdin;
1	1	\N	Tòa nhà biểu tượng hình búp sen của Sài Gòn.	\N	https://bitexcofinancialtower.com	\N	2026-04-05 10:01:15.936
2	2	\N	Biểu tượng công giáo của thành phố, kiến trúc Pháp cổ.	\N	\N	\N	2026-04-05 10:01:15.938
3	4	quán cà phê siêu chill	thêm chỗ này ii admin :D	0987654321	https://www.facebook.com/cafedocla/?locale=vi_VN	\N	2026-04-05 13:03:58.718
8	9	Chuyến tàu chạy dọc sông Sài Gòn, đi qua các công trình biểu tượng như Landmark 81, cầu Ba Son.	Cách rẻ nhất và chill nhất để ngắm toàn cảnh khu trung tâm từ mặt nước.	1900 63 68 30.	saigonwaterbus.com	\N	2026-04-07 06:08:16.654
9	10	Công trình kiến trúc tiêu biểu của những năm 60 với khuôn viên rộng 12ha ngay trung tâm.	Biểu tượng lịch sử không thể bỏ qua, không gian cực kỳ mát mẻ với hàng cây cổ thụ.	028 3822 3652.	https://dinhdoclap.gov.vn/	\N	2026-04-07 06:10:47.469
4	5	Mì Cay Seoul chi nhánh Lê Văn Thọ (Gò Vấp) là một quán ăn chuyên các món mì cay Hàn Quốc, nổi bật với mô hình “mì cay 7 cấp độ” quen thuộc nhưng được biến tấu phù hợp khẩu vị người Việt. Quán tọa lạc tại khu vực đông dân cư, dễ tìm, thuận tiện cho học sinh – sinh viên và dân văn phòng. Không gian mang phong cách trẻ trung, thoải mái, phù hợp đi nhóm bạn hoặc ăn nhanh.\n\nMenu tại đây khá đa dạng với các loại mì cay như bò, hải sản, thập cẩm, kết hợp nhiều topping như kim chi, chả cá, xúc xích, nấm… Nước dùng đậm đà, cay nồng nhưng có thể tùy chỉnh theo nhiều cấp độ khác nhau, từ nhẹ nhàng đến “thử thách vị giác”. Ngoài ra, quán còn phục vụ các món ăn kèm và đồ uống giúp cân bằng vị cay.	Mì Cay Seoul Lê Văn Thọ là quán mì cay Hàn Quốc nổi bật tại Gò Vấp với thực đơn đa dạng và đặc trưng 7 cấp độ cay hấp dẫn. Nước dùng đậm vị, topping phong phú, phù hợp khẩu vị người Việt. Không gian trẻ trung, thoải mái, thích hợp tụ tập bạn bè hoặc ăn nhanh. Đây là địa điểm quen thuộc cho những ai yêu thích món mì cay chuẩn vị Hàn nhưng dễ ăn, dễ “ghiền”.	0902 777 600	https://www.facebook.com/micayseoullevantho/?locale=vi_VN	\N	2026-04-07 07:04:05.345
6	7	Galaxy Cinema Nguyễn Du là một trong những rạp chiếu phim lâu đời và nổi tiếng nhất ở trung tâm TP.HCM. Rạp có 5 phòng chiếu với hơn 1000 chỗ ngồi, trang bị âm thanh Dolby 7.1 và màn hình hiện đại, mang lại trải nghiệm xem phim rõ nét, sống động . Vị trí ngay Quận 1 nên rất tiện kết hợp đi chơi, ăn uống trước hoặc sau khi xem phim.	Galaxy Nguyễn Du là rạp chiếu phim nằm ở trung tâm, nổi bật với giá vé hợp lý, chất lượng ổn định và không gian rộng rãi. Đây là địa điểm quen thuộc của giới trẻ nhờ dễ đi, nhiều suất chiếu và thường xuyên có ưu đãi.		https://www.galaxycine.vn/	\N	2026-04-07 05:52:48.831
10	11	Quán nằm trong hẻm, ngập tràn cây xanh, bàn ghế gỗ mộc mạc và decor rất có gu.	Một "ốc đảo" yên bình giữa lòng Quận 3 náo nhiệt.	098 716 01 75.	https://www.facebook.com/theseatcafe	\N	2026-04-07 06:19:38.79
11	12	Phục vụ các món như Nem nướng, bún cá sứa, lẩu chua cá bóp... trình bày đẹp mắt.	Không gian sang trọng nhưng ấm cúng, phù hợp đi gia đình hoặc tiếp khách.	028 6682 0692.	http://ganhvietnam.com/	\N	2026-04-07 06:21:45.987
12	13	Nơi tập trung các thương hiệu quốc tế và khu ẩm thực (Food Court) cực kỳ đa dạng dưới tầng hầm.	TTTM hiện đại và sang chảnh nhất Sài Gòn hiện nay.	028 3821 1819.	https://saigoncentre.com.vn/	\N	2026-04-07 06:23:48.058
13	14	Tọa lạc tại 3 tầng cao nhất (79, 80, 81) của tòa nhà Landmark 81. Tại đây có khu vực cầu kính SkyTouch lơ lửng trên không trung, khu vực cà phê sang trọng và các trò chơi cảm giác mạnh thực tế ảo như nhảy dù từ đỉnh tòa nhà.	Một trải nghiệm "chạm tới mây trời" thực thụ. Đây không chỉ là nơi ngắm cảnh mà còn là biểu tượng cho sự phát triển hiện đại của Sài Gòn, nơi bạn có thể thấy toàn bộ hệ thống sông ngòi và các quận huyện thu nhỏ trong tầm mắt.	098 160 16 20	https://vincom.com.vn/vincom-center-landmark-81	\N	2026-04-07 06:27:35.861
14	15	Một tòa dinh thự cổ kính xây dựng theo phong cách kiến trúc Pháp cuối thế kỷ 19 - đầu thế kỷ 20. Tòa nhà nổi bật với màu vàng đặc trưng, những ô cửa sổ hình vòm, gạch bông cổ điển và chiếc thang máy cổ nhất Sài Gòn vẫn còn được bảo tồn.	Nơi giao thoa giữa giá trị lịch sử và hơi thở nghệ thuật đương đại. Đây là thiên đường cho những ai yêu thích phong cách Vintage, Retro hoặc muốn tìm một góc lặng giữa trung tâm quận 1.	028 3829 4441	http://baotangmythuattphcm.com.vn/	\N	2026-04-07 07:03:31.292
7	8	Chiều Rooftop Beer là một rooftop bar nằm ngay trung tâm, nổi bật với không gian mở trên cao, view nhìn xuống thành phố khá “đã mắt” về đêm. Quán theo kiểu chill nhẹ, có bia, cocktail và nhạc, phù hợp tụ tập hoặc thư giãn sau giờ làm.	Chiều Rooftop Beer (kiểu Wow Skybar Nguyễn Du) là quán rooftop trung tâm, không gian thoáng, view đẹp, vibe chill nhẹ. Phù hợp đi uống bia, ngắm thành phố và trò chuyện hơn là quẩy mạnh.	0367 778 478	https://www.facebook.com/chieurooftop/?locale=vi_VN	\N	2026-04-07 07:03:48.653
5	6	AEON Mall Tân Phú Celadon là một trong những trung tâm thương mại lớn và hiện đại tại TP.HCM, nằm ở khu Celadon City, quận Tân Phú. Với quy mô hơn 70.000 m² và khoảng 200 cửa hàng, nơi đây tích hợp đầy đủ mua sắm, ăn uống và giải trí trong cùng một không gian .\n\nTrung tâm quy tụ nhiều thương hiệu trong và ngoài nước, khu siêu thị AEON, rạp chiếu phim CGV, khu vui chơi trẻ em và food court đa dạng từ món Á đến Âu. Không gian rộng rãi, sạch sẽ, mang phong cách Nhật Bản hiện đại, phù hợp cho cả gia đình, bạn bè và các hoạt động cuối tuần	AEON Mall Tân Phú Celadon là trung tâm mua sắm – giải trí quy mô lớn tại TP.HCM, nổi bật với không gian hiện đại, đa dạng cửa hàng và khu ẩm thực phong phú. Đây là địa điểm lý tưởng để mua sắm, ăn uống và vui chơi cho mọi lứa tuổi, đặc biệt vào dịp cuối tuần hoặc lễ.	028 6288 7733	https://aeonmall-tanphuceladon.com.vn/	\N	2026-04-07 07:03:58.594
15	16	Trục đường kéo dài từ trụ sở UBND Thành phố đến bến Bạch Đằng. Buổi tối nơi đây trở thành quảng trường lớn với nhạc nước, các nhóm nghệ sĩ tự do biểu diễn và hàng chục quán cafe chung cư cũ nổi tiếng.	"Trái tim" không ngủ của Sài Gòn. Nếu muốn biết người trẻ Sài Gòn chơi gì, cứ ra đây vào tối cuối tuần.			\N	2026-04-07 07:06:24.817
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
1	mapbox-id-bitexco	Tòa nhà Bitexco	2 Hải Triều, Bến Nghé, Quận 1, TP.HCM	10.7715	106.7042	\N	Tham quan	\N	\N	\N	2026-04-05 10:01:15.933	Quận 1	ngắm cảnh, tòa nhà, trung tâm	\N	APPROVED
2	hcm_church_001	Nhà thờ Đức Bà Sài Gòn	01 Công xã Paris, Bến Nghé, Quận 1, TP. Hồ Chí Minh	10.779785	106.699019	\N	Tham quan	\N	\N	\N	2026-04-05 10:01:15.937	Quận 1	nhà thờ, kiến trúc pháp, trung tâm	\N	APPROVED
3	mapbox-id-phobachung	Phở Bà Chung	Đường Pasteur, Quận 1, TP.HCM	10.775	106.7	\N	Ẩm thực	\N	\N	\N	2026-04-05 10:01:15.939	Quận 1	ăn sáng, phở, truyền thống	\N	APPROVED
4	1JZHoWVbczxw1KUvS16Wc_C-UozRfcqxve6CjI3Venut7jaJVXE-doEXbSDQLbZGLRbGgPVeKYcJz1-1U6YKKokXWoRQ	Cafe độc & lạ	16 Đ. Số 9, Phường 16, An Hội Đông, Hồ Chí Minh	10.8463543	106.669672	\N	cafe	\N	\N	100000	2026-04-05 13:04:31.485	Gò Vấp	Cà phê, yên tĩnh, học bài	6	APPROVED
8	Ib5u8PBmL8ZwrnSApVlO7UWuWqGlX7k2QpAYz5dnvUsZvG5NoyiHh32-JbTCWbbbNRqwgTIlYrdYYl2ApsV-1zXC8WQ-8a4COf69ZTY9qj-YZlUoZuWifjxi9QjKPa_TP	Chiều Rooftop Beer	Chiều Rooftop Beer, 07 Đường Cộng Hòa, Phường 4, Tân Bình, Hồ Chí Minh	10.8006338	106.6601675	\N	restaurant	\N	\N	150000	2026-04-07 07:03:48.652	Tân Bình	Cà phê, rooftop, bar	6	APPROVED
6	OgdXpEZFRFFupnytJ3ip5UqmUa1DTZ_HUphvtUUQ-PhmtCCBB1qPwXmxQoi-Z7vOZYAogSFOpd5Qn2irtBC9xVe5j2Z4tIhRY6eGhxF3h-B5inUJjYBGXh7G1Soc-EPzH	AEON TÂN PHÚ	AEON TÂN PHÚ, Bờ Bao Tân Thắng, Celadon City, Sơn Kỳ, Tân Phú, Hồ Chí Minh	10.8011622	106.6173945	\N	store	\N	\N	\N	2026-04-07 07:03:58.592	Tân Phú	Mua sắm, trung tâm thương mại, ăn uống	6	APPROVED
5	TUOBblQ0s6NQmW5jqwWahH-yt0xIYJGDUKOGrb-ikft8Ln1-v0S76WOfR2GAQ7_-ZrBUcLdCp4ZriDXpzjmWGoR_KXH9MQ6jJZaH_cVcXgehkm0QXtzyRgWazTBaBOPrB	Mì Cay Seoul Gò Vấp - 244 Lê Văn Thọ	Mì Cay Seoul Gò Vấp - 244 Lê Văn Thọ, 244 Lê Văn Thọ, Phường 11, Gò Vấp, Thành phố Hồ Chí Minh	10.8436669	106.6572666	\N	restaurant	\N	\N	100000	2026-04-07 07:04:05.344	Gò Vấp	Mì cay, đồ Hàn, ăn uống	6	APPROVED
7	ajBAqYY9p8xgn36ctWSGh1W3aiuvZb_8e5pIBoRqio1iqWoZgBOrzlWcYgS0dbfkZ5thZIUeis1c9pG9Is3aZs1TDWC_sZYa0YTxTpYV1hexgR0ATsxOVhWK3SDiFEv7F	Galaxy Cinema	Galaxy Cinema, 116 Nguyễn Du, Bến Thành, Quận 1, Hồ Chí Minh	10.772975127000052	106.69338383700006	\N		\N	\N	100000	2026-04-07 05:52:48.829	Quận 1	Xem phim	6	APPROVED
9	Z0YQqXiaUn1IkaxBd1Xk4HW-nlpkkFLldr2fLkqfm91-27MkrJetfWK2rj9SnaH5eNuYGUZ-l9hPgHsDYgqfJfrW9r1xJwIdSe7-fXVpvn_Ymhal6UgmPnwmtnyJSCOTf	Sài Gòn waterbus bạch đằng	Sài Gòn waterbus bạch đằng, 10 Đường Tôn Đức Thắng, Bến Nghé, Quận 1, Thành phố Hồ Chí Minh	10.7745721	106.706293	\N	tourist_attraction	\N	\N	15000	2026-04-07 06:08:16.653	Quận 1	waterbus sông Sài Gòn, Saigon waterbus	6	APPROVED
10	fURxlVBwpO4AjLlSolnvlnR_mw68Z-rSRYtIFZoCLNVxpFulmWRT4XOpUC-QWLv-d4sBVqtumc9yp26jV16VkmmnUKa8XJnRdLVDPV5Vxlfxlj1ADowOdhXKnWCiVApXV	Di tích dinh Độc Lập	Dinh Độc Lập, 135 Nam Kỳ Khởi Nghĩa, Bến Thành, Quận 1, Hồ Chí Minh	10.777128209000068	106.69540061000004	\N	tourist_attraction	\N	\N	65000	2026-04-07 06:10:47.468	Quận 1	Dinh Độc Lập, Independence Palace	6	APPROVED
11	T5o8tlKsp2Z4qSJCsGG4w3fBUAFkhPr8b0hcnHuNjXRhN2oAtt-r-VWbVD-91ZqSGYZ9cHrJJmfqzp34cVHqK56-fcj2DWI3jYaVTR4V1hexgn0ATsxOVhWK3SDiFEv7F	The Seat Cafe	The Seat Cafe, 491/2 Đ. Lê Văn Sỹ, Phường 12, Quận 3, Hồ Chí Minh	10.78993	106.673713	\N	cafe	\N	\N	75000	2026-04-07 06:19:38.789	Quận 3	Cà phê, chụp ảnh, làm việc	6	APPROVED
12	VZKDoK_WvJxwvEkz_ka9x3G9YyycRbptXaxVCKLliW9ao0EUMkBu79nGsdAKMUY3wWzVoy4RBushZQU8S_36__mtmYxW2bYzRaKxaTox8hLpplkka5RqMjGu-QTH3G7rM	Gánh - Đặc sản Nha Trang	Gánh - Đặc sản Nha Trang, 4 Hẻm 58 Phạm Ngọc Thạch, Võ Thị Sáu, Quận 3, Hồ Chí Minh	10.786189610000065	106.69251572900004	\N	restaurant	\N	\N	200000	2026-04-07 06:21:45.986	Quận 3	Nhà hàng Gánh, đặc sản Nha Trang	6	APPROVED
13	jQD1tH6eY3F8m0s9g5JmgE-YcTawT2TYUJhXOKgUrPw7o09lqYrxcgOxVK6zyo7xUw91ooNijoFmml8btUiwT2icxC-FcZEpfZqJUQIJygutnmEcUtBSSgmWwTz-CFfnC	Saigon Centre	Saigon Centre, 65 Lê Lợi, Bến Nghé, Quận 1, Hồ Chí Minh	10.773213043000055	106.70093172600008	\N	store	\N	\N	\N	2026-04-07 06:23:48.057	Quận 1	Takashimaya, Saigon Centre	6	APPROVED
14	922ShP9cIsqgQbxLvFyQy0ZWUUm_QP_qapWDSowYfORmNYCviRv_-2U-QSu9fGi6jKxaAYtuW0o1wvEkOuhm--3HKQTi7RqLlaKxaTox8jOVplkkauhqcjGu-QTGMG_fM	Landmark 81 skyview	Landmark 81 skyview, Landmark 81, Phường 22, Bình Thạnh, Hồ Chí Minh	10.794873535000022	106.72186647000007	\N	tourist_attraction	\N	\N	420000	2026-04-07 06:27:35.86	Bình Thạnh	Landmark 81 SkyView, toà nhà cao cấp nhất Việt Nam	6	APPROVED
15	eXyeY3m0q8hlgmBcuKnuq80p8TRyUDLGah39NOJB5r5B53CFRmA2v-Ze4WThVDlHHoqh6POtSpsBIqE0H43ix4rRlawPnapjkpLhOWphorvF9gl0OiA6YmH-qVSXjD67Y	Bảo tàng Mỹ thuật	Bảo tàng Mỹ thuật TP. Hồ Chí Minh, 97A Phó Đức Chính, Nguyễn Thái Bình, Quận 1, Hồ Chí Minh	10.769667426000069	106.69945498400006	\N	tourist_attraction	\N	\N	30000	2026-04-07 07:03:31.291	Quận 1	Bảo tàng Mỹ thuật Sài Gòn, Fine Arts Museum	6	APPROVED
16	U8aogmuCpEdVxls9she4y2aueTOEYjvdYE7As-bFxHMpmnE-KqXGGJnzGW-m1FbCFtKFYRE9wjeq8vnwPekv9xmCcdQK1T6zkZqJUQIJygutnmEcUY7SSgmWwTz8UFfnC	Phố đi bộ Nguyễn Huệ	Phố đi bộ Nguyễn Huệ, Nguyễn Huệ, Bến Nghé, Quận 1, Hồ Chí Minh	10.774097806000047	106.70363123800007	\N	tourist_attraction	\N	\N	\N	2026-04-07 07:06:24.815	Quận 1	Phố đi bộ, công viên bờ sông	6	APPROVED
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
1	1	7	Ngắm Sài Gòn từ Skydeck	Trải nghiệm thang máy tốc độ cao lên tầng 49.	Trải nghiệm	18:00 - 19:00	\N	2026-04-05 10:01:15.94
2	4	6	Uống cà phê	quán thì chill, tiền nong thì kill	Uống cà phê	sáng trưa chiều	69000.00	2026-04-05 13:03:58.724
5	7	6	Xem phim	Đi rạp này cảm giác khá “classic” nhưng vẫn ổn áp, không quá sang nhưng xem phim rất ok\nNên đặt vé trước, vì phim hot dễ hết vé và rạp khá đông\nĐi sớm chút để mua bắp nước, vì giờ cao điểm xếp hàng khá lâu\nNếu đi hẹn hò thì có thể chọn ghế đôi phía sau, khá riêng tư\nVé ở đây nhìn chung mềm hơn nhiều rạp khác, đặc biệt là ngày thường hoặc ưu đãi\nTổng thể: phù hợp nếu bạn cần một rạp giá tốt, dễ đi, xem ổn định, không cần quá “xịn sò” nhưng vẫn đủ trải nghiệm 	xem phim	Trưa, chiều, tối	100000.00	2026-04-07 05:52:48.834
7	9	6	Ngắm cảnh sông Sài Gòn trên tàu siêu tốc	Nên đi vào lúc 16h30 - 17h30 để ngắm hoàng hôn và lúc thành phố lên đèn\nNên đặt vé online trước ít nhất 1-2 ngày nếu đi cuối tuần vì rất nhanh hết vé đẹp.	Check-in, ngắm cảnh, đi tàu	Buổi chiều từ 16h30 - 17h30	15000.00	2026-04-07 06:08:16.658
8	10	6	Tham quan kiến trúc, tìm hiểu lịch sử	Nên đi vào buổi sáng từ 8h - 10h để tránh nắng nóng\nNên thuê tai nghe thuyết minh tự động (audio guide) để hiểu hết ý nghĩa các phòng và sự kiện lịch sử.	Check-in, tham quan Dinh Độc Lập	Sáng sớm từ 8h - 10h	65000.00	2026-04-07 06:10:47.472
9	11	6	Thưởng thức cafe, chụp hình sống ảo	Nên đi vào những ngày buổi sáng nắng xiên qua lá, rất đẹp để chụp hình\nQuán có nhiều góc nhỏ riêng tư, rất hợp cho các cặp đôi hoặc người muốn tập trung làm việc.	Cà phê, chụp ảnh	Buổi sáng 	75000.00	2026-04-07 06:19:38.793
10	12	6	Thưởng thức ẩm thực miền Trung	Món "Nem nướng Nha Trang" ở đây là đặc sản nhất định phải thử. Nên đặt bàn trước vào cuối tuần.	Ẩm thực	Bữa trưa hoặc bữa tối	200000.00	2026-04-07 06:21:45.992
11	13	6	Mua sắm, ăn uống	Khu vực sảnh chính thường có các cụm trang trí theo mùa (Trung thu, Giáng sinh, Tết) rất hoành tráng để chụp ảnh.	Check-in, ẩm thực, mua sắm	Cả ngày	100000.00	2026-04-07 06:23:48.061
12	14	6	Ngắm toàn cảnh thành phố	Đừng chỉ lên ngắm cảnh rồi về, hãy dành thời gian check-in tại khu vực ghế ngồi sát kính để có những bức ảnh "vô thực".\n\nNếu bạn thấy vé lên SkyView quá cao, một mẹo nhỏ là có thể vào các quán cafe/bar ở tầng 75-76 (như Blank Lounge). Giá một ly nước khoảng 200k-300k, tuy thấp hơn vài tầng nhưng vẫn đủ để ngắm cảnh và không gian rất chill.\n\nNhớ kiểm tra thời tiết trước khi đi; nếu trời quá mù hoặc mưa lớn, tầm nhìn sẽ bị hạn chế rất nhiều.	Check-in, ngắm cảnh	Buổi chiều 17h - 18h30	420000.00	2026-04-07 06:27:35.864
13	15	6	Chụp ảnh nghệ thuật	Bảo tàng có 3 tòa nhà khác nhau, tòa chính giữa là nơi có nhiều góc chụp ảnh đẹp nhất.\n\nLưu ý quan trọng: Nếu bạn mang theo máy ảnh cơ (DSLR), bảo tàng sẽ thu thêm phí chụp hình (khá cao). Nếu chỉ dùng điện thoại thì hoàn toàn miễn phí.\n\nTrang phục: Nên mặc đồ có màu trắng, be hoặc các tông màu nổi bật (đỏ, xanh đậm) để tương phản với nền tường vàng cổ điển của bảo tàng.	Check-in, tham quan	Buổi sáng 9h - 11h	30000.00	2026-04-07 07:03:31.295
14	8	6	Chụp hình rooftop, bar	Đi tầm chiều tối – hoàng hôn là đẹp nhất, lúc này lên đèn nhìn rất chill\nNgồi ngoài trời sẽ đáng tiền hơn trong nhà vì có gió và view\nGiá đồ uống hơi cao hơn quán bình thường, nhưng đổi lại là không gian\nNếu đi cuối tuần nên đi sớm hoặc đặt chỗ trước vì dễ đông\n\nTổng thể: hợp để chill nhẹ, ngắm view, nói chuyện, không quá ồn ào nhưng vẫn có không khí về đêm khá cuốn	Check-in, bar, cà phê	Buổi chiều từ 17h - 22h	\N	2026-04-07 07:03:48.658
15	6	6	Đi dạo trong trung tâm thương mại	Nên đi tầm trưa hoặc chiều cho đỡ đông\nNếu ăn uống thì cứ vào food court cho dễ chọn\nSiêu thị buổi tối hay có đồ giảm giá, đáng thử\n\nTổng thể: hợp để đi chơi nhẹ nhàng, ăn uống, xem phim; kiểu đi một vòng là hết cả buổi mà không chán	Check-in, all-in-one	Cả ngày	\N	2026-04-07 07:03:58.598
16	5	6	thưởng thức mì cay	Nên chọn cấp độ cay vừa phải để thưởng thức trọn vị, tránh quá cay gây “đuối”.\nĂn chậm, kết hợp topping giúp cân bằng vị cay.\nĐi nhóm sẽ vui hơn vì có thể “thử thách ăn cay”.\nNên đi sớm hoặc tránh giờ tối cao điểm để không phải chờ lâu.	Ẩm thực, đồ Hàn	Buổi chiều từ 15h - 20h	\N	2026-04-07 07:04:05.349
17	16	6	Đi dạo, xem biểu diễn nghệ thuật đường phố	Gửi xe: Tránh gửi ở các bãi tự phát ven đường với giá "cắt cổ". Hãy vào hầm xe của các tòa nhà quanh đó như Bitexco, Saigon Centre hoặc hầm xe của phố đi bộ dưới chân khách sạn Rex.\n\nĂn uống: Đừng bỏ qua "Thiên đường cafe chung cư" tại số 42 Nguyễn Huệ. Mỗi căn hộ là một quán cafe với phong cách riêng biệt.\n\nTừ phố đi bộ, bạn chỉ cần băng qua đường là tới Công viên bến Bạch Đằng mới được nâng cấp cực đẹp, rất thoáng mát để ngồi ngắm tàu thuyền chạy trên sông.	check-in, đi dạo, ăn vặt, hóng gió	Buổi tối sau 19h	\N	2026-04-07 07:06:24.819
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
1	7	Sài Gòn kiến trúc & ánh đèn	Khám phá các biểu tượng của Quận 1	1	1 ngày	0	2026-04-05 10:01:15.942	\N	\N
\.


--
-- Data for Name: lichtrinh_mau_diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lichtrinh_mau_diadiem (id, lichtrinh_mau_id, diadiem_id, thutu, ngay_thu_may, thoigian_den, thoiluong, ghichu) FROM stdin;
1	1	3	1	1	\N	\N	Ăn sáng nạp năng lượng.
2	1	1	2	1	\N	\N	Tham quan tòa nhà biểu tượng.
\.


--
-- Data for Name: lichtrinh_nguoidung; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lichtrinh_nguoidung (lichtrinh_nguoidung_id, nguoidung_id, tieude, trangthai, ngaytao, ngaybatdau, ngayketthuc) FROM stdin;
1	8	Du lịch lễ 30/04	planning	2026-04-05 10:01:15.949	2026-04-30	2026-05-02
\.


--
-- Data for Name: lichtrinh_nguoidung_diadiem; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.lichtrinh_nguoidung_diadiem (lichtrinh_nguoidung_id, diadiem_id, thutu, thoigian_den, thoiluong, ghichu, id, ngay_thu_may) FROM stdin;
1	3	1	\N	\N	\N	1	1
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
6	admin@travel.com	$2b$10$kbkg5sT6SKRYJatvrNqtFe3Ej2mpH6tkDa.tv7cN2RY8Tk87vCZQK	Quản trị viên	\N	active	2026-04-05 10:01:15.924	2026-04-05 10:01:15.924	\N	\N	admin
7	local@travel.com	$2b$10$kbkg5sT6SKRYJatvrNqtFe3Ej2mpH6tkDa.tv7cN2RY8Tk87vCZQK	Minh Local Guide	\N	active	2026-04-05 10:01:15.928	2026-04-05 10:01:15.928	\N	\N	local
8	user@travel.com	$2b$10$kbkg5sT6SKRYJatvrNqtFe3Ej2mpH6tkDa.tv7cN2RY8Tk87vCZQK	Khách du lịch	\N	active	2026-04-05 10:01:15.929	2026-04-05 10:01:15.929	\N	\N	user
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
1	Chill	Thư giãn, nhẹ nhàng
2	Ẩm thực	Khám phá đồ ăn địa phương
3	Lịch sử	Bảo tàng, di tích
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

SELECT pg_catalog.setval('public.diadiem_diadiem_id_seq', 16, true);


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

SELECT pg_catalog.setval('public.lichtrinh_nguoidung_diadiem_id_seq', 1, true);


--
-- Name: lichtrinh_nguoidung_lichtrinh_nguoidung_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.lichtrinh_nguoidung_lichtrinh_nguoidung_id_seq', 1, true);


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

\unrestrict vHHoAaGMUzEchicLmJk39g4solLLvsrQCE8RGymEBDTsXY5pa87sguc89mqHBYv


#include <backends/cxxrtl/cxxrtl.h>

#if defined(CXXRTL_INCLUDE_CAPI_IMPL) || \
    defined(CXXRTL_INCLUDE_VCD_CAPI_IMPL)
#include <backends/cxxrtl/cxxrtl_capi.cc>
#endif

#if defined(CXXRTL_INCLUDE_VCD_CAPI_IMPL)
#include <backends/cxxrtl/cxxrtl_vcd_capi.cc>
#endif

using namespace cxxrtl_yosys;

namespace cxxrtl_design {

// \top: 1
// \src: chip-v3/src/project.v:14.1-81.10
struct p_tt__um__ai__wrangler__uds3 : public module {
	// \hdlname: core t
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:51.15-51.16
	wire<6> p_core_2e_t;
	// \hdlname: core v
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:52.15-52.16
	wire<1> p_core_2e_v;
	// \hdlname: core frame
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:53.15-53.20
	wire<13> p_core_2e_frame;
	// \hdlname: core clearing
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:54.15-54.23
	wire<1> p_core_2e_clearing;
	// \hdlname: core ring
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:71.17-71.21
	wire<128> p_core_2e_ring;
	// \hdlname: core c_env
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:100.13-100.18
	wire<8> p_core_2e_c__env;
	// \hdlname: core c_dec
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:101.7-101.12
	wire<1> p_core_2e_c__dec;
	// \hdlname: core c_adec
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:101.14-101.20
	wire<1> p_core_2e_c__adec;
	// \hdlname: core c_alt8
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:101.22-101.28
	wire<1> p_core_2e_c__alt8;
	// \hdlname: core c_lin
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:101.30-101.35
	wire<1> p_core_2e_c__lin;
	// \hdlname: core c_tone
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:148.13-148.19
	wire<8> p_core_2e_c__tone;
	// \hdlname: core c_clap
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:149.13-149.19
	wire<1> p_core_2e_c__clap;
	// \hdlname: core c_mix
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:150.13-150.18
	wire<3> p_core_2e_c__mix;
	// \hdlname: core c_color
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:151.13-151.20
	wire<2> p_core_2e_c__color;
	// \hdlname: core bor
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:166.14-166.17
	wire<1> p_core_2e_bor;
	// \hdlname: core cy
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:174.14-174.16
	wire<1> p_core_2e_cy;
	// \hdlname: core pend
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:191.14-191.18
	wire<1> p_core_2e_pend;
	// \hdlname: core tgt
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:191.20-191.23
	wire<1> p_core_2e_tgt;
	// \hdlname: core hv
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:191.25-191.27
	wire<1> p_core_2e_hv;
	// \hdlname: core con
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:191.29-191.32
	wire<1> p_core_2e_con;
	// \hdlname: core kill
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:191.34-191.38
	wire<1> p_core_2e_kill;
	// \hdlname: core kill_pend
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:191.40-191.49
	wire<1> p_core_2e_kill__pend;
	// \hdlname: core cb
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:192.14-192.16
	wire<3> p_core_2e_cb;
	// \hdlname: core lfsr
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:281.14-281.18
	wire<17> p_core_2e_lfsr;
	// \hdlname: core sd_v1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:318.15-318.20
	wire<11> p_core_2e_sd__v1;
	// \hdlname: core sd_v2
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:319.15-319.20
	wire<12> p_core_2e_sd__v2;
	// \hdlname: spi ch
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:31.23-31.25
	wire<3> p_spi_2e_ch;
	// \hdlname: spi rx
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:34.23-34.25
	wire<8> p_spi_2e_rx;
	// \hdlname: spi cs_s
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:37.13-37.17
	wire<2> p_spi_2e_cs__s;
	// \hdlname: spi sck_s
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:38.13-38.18
	wire<3> p_spi_2e_sck__s;
	// \hdlname: spi mosi_s
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:39.13-39.19
	wire<1> p_spi_2e_mosi__s;
	// \hdlname: spi bitcnt
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:40.13-40.19
	wire<3> p_spi_2e_bitcnt;
	// \hdlname: spi bytecnt
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:41.13-41.20
	wire<3> p_spi_2e_bytecnt;
	// \hdlname: spi is_hit
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:42.13-42.19
	wire<1> p_spi_2e_is__hit;
	// \src: chip-v3/src/project.v:22.23-22.28
	/*input*/ value<1> p_rst__n;
	// \src: chip-v3/src/project.v:21.23-21.26
	/*input*/ value<1> p_clk;
	value<1> prev_p_clk;
	bool posedge_p_clk() const {
		return !prev_p_clk.slice<0>().val() && p_clk.slice<0>().val();
	}
	// \src: chip-v3/src/project.v:20.23-20.26
	/*input*/ value<1> p_ena;
	// \src: chip-v3/src/project.v:19.23-19.29
	/*output*/ value<8> p_uio__oe;
	// \src: chip-v3/src/project.v:18.23-18.30
	/*output*/ value<8> p_uio__out;
	// \src: chip-v3/src/project.v:17.23-17.29
	/*input*/ value<8> p_uio__in;
	// \src: chip-v3/src/project.v:16.23-16.29
	/*output*/ value<8> p_uo__out;
	// \src: chip-v3/src/project.v:15.23-15.28
	/*input*/ value<8> p_ui__in;
	// \hdlname: core busy
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:43.23-43.27
	/*outline*/ value<1> p_core_2e_busy;
	// \hdlname: core frame_sync
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:44.23-44.33
	/*outline*/ value<1> p_core_2e_frame__sync;
	// \hdlname: core wend
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:55.15-55.19
	/*outline*/ value<1> p_core_2e_wend;
	// \hdlname: core fend
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:56.15-56.19
	/*outline*/ value<1> p_core_2e_fend;
	// \hdlname: core r
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:57.15-57.16
	/*outline*/ value<3> p_core_2e_r;
	// \hdlname: core j
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:58.15-58.16
	/*outline*/ value<3> p_core_2e_j;
	// \hdlname: core tail
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:72.17-72.21
	/*outline*/ value<1> p_core_2e_tail;
	// \hdlname: core head
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:73.17-73.21
	/*outline*/ value<1> p_core_2e_head;
	// \hdlname: core w0
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:78.16-78.18
	/*outline*/ value<64> p_core_2e_w0;
	// \hdlname: core nw
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:78.20-78.22
	/*outline*/ value<64> p_core_2e_nw;
	// \hdlname: core z_decay
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:88.14-88.21
	/*outline*/ value<4> p_core_2e_z__decay;
	// \hdlname: core z_bt
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:89.14-89.18
	/*outline*/ value<3> p_core_2e_z__bt;
	// \hdlname: core z_lin
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:90.14-90.19
	/*outline*/ value<1> p_core_2e_z__lin;
	// \hdlname: core z_aux
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:91.14-91.19
	/*outline*/ value<8> p_core_2e_z__aux;
	// \hdlname: core z_ad
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:92.14-92.18
	/*outline*/ value<4> p_core_2e_z__ad;
	// \hdlname: core tz
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:93.14-93.16
	/*outline*/ value<4> p_core_2e_tz;
	// \hdlname: core n_pitch
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:112.14-112.21
	/*outline*/ value<8> p_core_2e_n__pitch;
	// \hdlname: core n_wave
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:113.14-113.20
	/*outline*/ value<2> p_core_2e_n__wave;
	// \hdlname: core n_color
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:114.14-114.21
	/*outline*/ value<2> p_core_2e_n__color;
	// \hdlname: core n_bend
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:115.14-115.20
	/*outline*/ value<2> p_core_2e_n__bend;
	// \hdlname: core n_mode
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:116.14-116.20
	/*outline*/ value<2> p_core_2e_n__mode;
	// \hdlname: core n_mix
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:117.14-117.19
	/*outline*/ value<3> p_core_2e_n__mix;
	// \hdlname: core n_env
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:118.14-118.19
	/*outline*/ value<8> p_core_2e_n__env;
	// \hdlname: core n_aux
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:119.14-119.19
	/*outline*/ value<8> p_core_2e_n__aux;
	// \hdlname: core n_ph
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:120.14-120.18
	/*outline*/ value<10> p_core_2e_n__ph;
	// \hdlname: core p_pitch
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:125.15-125.22
	/*outline*/ value<8> p_core_2e_p__pitch;
	// \hdlname: core p_bend
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:126.15-126.21
	/*outline*/ value<2> p_core_2e_p__bend;
	// \hdlname: core p_aux
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:127.15-127.20
	/*outline*/ value<8> p_core_2e_p__aux;
	// \hdlname: core off
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:128.15-128.18
	/*outline*/ value<8> p_core_2e_off;
	// \hdlname: core pe_raw
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:129.15-129.21
	/*outline*/ value<9> p_core_2e_pe__raw;
	// \hdlname: core p_pe
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:130.15-130.19
	/*outline*/ value<8> p_core_2e_p__pe;
	// \hdlname: core fold
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:133.14-133.18
	/*outline*/ value<8> p_core_2e_fold;
	// \hdlname: core trw
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:134.14-134.17
	/*outline*/ value<8> p_core_2e_trw;
	// \hdlname: core drv
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:135.14-135.17
	/*outline*/ value<8> p_core_2e_drv;
	// \hdlname: core sqb
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:136.14-136.17
	/*outline*/ value<1> p_core_2e_sqb;
	// \hdlname: core n_tone
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:137.14-137.20
	/*outline*/ value<8> p_core_2e_n__tone;
	// \hdlname: core a3
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:142.14-142.16
	/*outline*/ value<3> p_core_2e_a3;
	// \hdlname: core n_meff
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:143.14-143.20
	/*outline*/ value<3> p_core_2e_n__meff;
	// \hdlname: core is_aux
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:167.14-167.20
	/*outline*/ value<1> p_core_2e_is__aux;
	// \hdlname: core sml
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:168.14-168.17
	/*outline*/ value<1> p_core_2e_sml;
	// \hdlname: core d_bit
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:169.14-169.19
	/*outline*/ value<1> p_core_2e_d__bit;
	// \hdlname: core bor_in
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:170.14-170.20
	/*outline*/ value<1> p_core_2e_bor__in;
	// \hdlname: core sub_out
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:171.14-171.21
	/*outline*/ value<1> p_core_2e_sub__out;
	// \hdlname: core pj
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:175.14-175.16
	/*outline*/ value<4> p_core_2e_pj;
	// \hdlname: core pk
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:176.14-176.16
	/*outline*/ value<5> p_core_2e_pk;
	// \hdlname: core mant
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:177.14-177.18
	/*outline*/ value<6> p_core_2e_mant;
	// \hdlname: core inc_bit
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:178.14-178.21
	/*outline*/ value<1> p_core_2e_inc__bit;
	// \hdlname: core cy_in
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:179.14-179.19
	/*outline*/ value<1> p_core_2e_cy__in;
	// \hdlname: core ph_new
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:180.14-180.20
	/*outline*/ value<1> p_core_2e_ph__new;
	// \hdlname: core choice
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:193.14-193.20
	/*outline*/ value<1> p_core_2e_choice;
	// \hdlname: core cbit
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:219.7-219.11
	/*outline*/ value<1> p_core_2e_cbit;
	// \hdlname: core cwr
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:219.13-219.16
	/*outline*/ value<1> p_core_2e_cwr;
	// \hdlname: core e0
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:254.14-254.16
	/*outline*/ value<8> p_core_2e_e0;
	// \hdlname: core e1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:254.18-254.20
	/*outline*/ value<8> p_core_2e_e1;
	// \hdlname: core h0
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:255.14-255.16
	/*outline*/ value<3> p_core_2e_h0;
	// \hdlname: core h1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:255.18-255.20
	/*outline*/ value<3> p_core_2e_h1;
	// \hdlname: core hg
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:268.14-268.16
	/*outline*/ value<3> p_core_2e_hg;
	// \hdlname: core act0
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.14-269.18
	/*outline*/ value<1> p_core_2e_act0;
	// \hdlname: core act1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.26-269.30
	/*outline*/ value<1> p_core_2e_act1;
	// \hdlname: core same0
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:270.14-270.19
	/*outline*/ value<1> p_core_2e_same0;
	// \hdlname: core same1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:271.14-271.19
	/*outline*/ value<1> p_core_2e_same1;
	// \hdlname: core pc4
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:290.14-290.17
	/*outline*/ value<3> p_core_2e_pc4;
	// \hdlname: core dark
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:291.14-291.18
	/*outline*/ value<8> p_core_2e_dark;
	// \hdlname: core white
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:292.14-292.19
	/*outline*/ value<8> p_core_2e_white;
	// \hdlname: core brite
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:293.14-293.19
	/*outline*/ value<8> p_core_2e_brite;
	// \hdlname: core metal
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:294.14-294.19
	/*outline*/ value<8> p_core_2e_metal;
	// \hdlname: core noise
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:295.14-295.19
	/*outline*/ value<8> p_core_2e_noise;
	// \hdlname: core sel_n
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:302.14-302.19
	/*outline*/ value<1> p_core_2e_sel__n;
	// \hdlname: core qr
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:304.14-304.16
	/*outline*/ value<6> p_core_2e_qr;
	// \hdlname: core w8
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:305.14-305.16
	/*outline*/ value<1> p_core_2e_w8;
	// \hdlname: core w1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:306.14-306.16
	/*outline*/ value<1> p_core_2e_w1;
	// \hdlname: core src
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:307.14-307.17
	/*outline*/ value<8> p_core_2e_src;
	// \hdlname: core x
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:308.14-308.15
	/*outline*/ value<8> p_core_2e_x;
	// \hdlname: core y
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:320.15-320.16
	/*outline*/ value<1> p_core_2e_y;
	// \hdlname: core x_fb
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:321.15-321.19
	/*outline*/ value<12> p_core_2e_x__fb;
	// \hdlname: core s1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:322.15-322.17
	/*outline*/ value<12> p_core_2e_s1;
	// \hdlname: core lo
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:323.15-323.17
	/*outline*/ value<10> p_core_2e_lo;
	// \hdlname: core hi
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:324.15-324.17
	/*outline*/ value<3> p_core_2e_hi;
	// \hdlname: core v1_n
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:325.15-325.19
	/*outline*/ value<11> p_core_2e_v1__n;
	// \hdlname: core v2_n
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:326.15-326.19
	/*outline*/ value<12> p_core_2e_v2__n;
	// \hdlname: core sd_restart
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:327.15-327.25
	/*outline*/ value<1> p_core_2e_sd__restart;
	// \hdlname: spi cs_n_pin
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:24.23-24.31
	/*outline*/ value<1> p_spi_2e_cs__n__pin;
	// \hdlname: spi sck_pin
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:25.23-25.30
	/*outline*/ value<1> p_spi_2e_sck__pin;
	// \hdlname: spi mosi_pin
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:26.23-26.31
	/*outline*/ value<1> p_spi_2e_mosi__pin;
	// \hdlname: spi miso
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:27.23-27.27
	/*outline*/ value<1> p_spi_2e_miso;
	// \hdlname: spi hit_cmd
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:29.23-29.30
	/*outline*/ value<1> p_spi_2e_hit__cmd;
	// \hdlname: spi stop
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:30.23-30.27
	/*outline*/ value<1> p_spi_2e_stop;
	// \hdlname: spi byte_done
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:32.23-32.32
	/*outline*/ value<1> p_spi_2e_byte__done;
	// \hdlname: spi active
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:44.14-44.20
	/*outline*/ value<1> p_spi_2e_active;
	// \hdlname: spi rise
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:45.14-45.18
	/*outline*/ value<1> p_spi_2e_rise;
	// \hdlname: spi last_bit
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:46.14-46.22
	/*outline*/ value<1> p_spi_2e_last__bit;
	// \hdlname: spi byte_in
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:47.14-47.21
	/*outline*/ value<8> p_spi_2e_byte__in;
	// \hdlname: spi cmd_end
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:48.14-48.21
	/*outline*/ value<1> p_spi_2e_cmd__end;
	// \src: chip-v3/src/project.v:61.13-61.18
	/*outline*/ value<7> p_digit;
	p_tt__um__ai__wrangler__uds3(interior) {}
	p_tt__um__ai__wrangler__uds3() {
		reset();
	};

	void reset() override;
	bool eval() override;
	bool commit() override;

	void debug_eval();
	debug_outline debug_eval_outline { std::bind(&p_tt__um__ai__wrangler__uds3::debug_eval, this) };

	void debug_info(debug_items &items, std::string path = "") override;
}; // struct p_tt__um__ai__wrangler__uds3

void p_tt__um__ai__wrangler__uds3::reset() {
}

bool p_tt__um__ai__wrangler__uds3::eval() {
	bool converged = true;
	bool posedge_p_clk = this->posedge_p_clk();
	value<1> i_procmux_24_454__Y;
	value<1> i_procmux_24_363__Y;
	value<20> i_procmux_24_274__Y;
	// \hdlname: core clk
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:32.23-32.26
	value<1> p_core_2e_clk;
	// \hdlname: core hit_cmd
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:35.23-35.30
	value<1> p_core_2e_hit__cmd;
	// \hdlname: core hit_ch
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:37.23-37.29
	value<3> p_core_2e_hit__ch;
	// \hdlname: core byte_done
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:38.23-38.32
	value<1> p_core_2e_byte__done;
	// \hdlname: core hold
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:40.23-40.27
	value<8> p_core_2e_hold;
	// \hdlname: core wend
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:55.15-55.19
	value<1> p_core_2e_wend;
	// \hdlname: core fend
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:56.15-56.19
	value<1> p_core_2e_fend;
	// \hdlname: core r
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:57.15-57.16
	value<3> p_core_2e_r;
	// \hdlname: core j
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:58.15-58.16
	value<3> p_core_2e_j;
	// \hdlname: core head
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:73.17-73.21
	value<1> p_core_2e_head;
	// \hdlname: core w0
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:78.16-78.18
	value<64> p_core_2e_w0;
	// \hdlname: core nw
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:78.20-78.22
	value<64> p_core_2e_nw;
	// \hdlname: core z_bt
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:89.14-89.18
	value<3> p_core_2e_z__bt;
	// \hdlname: core z_aux
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:91.14-91.19
	value<8> p_core_2e_z__aux;
	// \hdlname: core tz
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:93.14-93.16
	value<4> p_core_2e_tz;
	// \hdlname: core n_wave
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:113.14-113.20
	value<2> p_core_2e_n__wave;
	// \hdlname: core n_mode
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:116.14-116.20
	value<2> p_core_2e_n__mode;
	// \hdlname: core n_mix
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:117.14-117.19
	value<3> p_core_2e_n__mix;
	// \hdlname: core n_aux
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:119.14-119.19
	value<8> p_core_2e_n__aux;
	// \hdlname: core n_ph
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:120.14-120.18
	value<10> p_core_2e_n__ph;
	// \hdlname: core p_bend
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:126.15-126.21
	value<2> p_core_2e_p__bend;
	// \hdlname: core p_aux
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:127.15-127.20
	value<8> p_core_2e_p__aux;
	// \hdlname: core pe_raw
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:129.15-129.21
	value<9> p_core_2e_pe__raw;
	// \hdlname: core fold
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:133.14-133.18
	value<8> p_core_2e_fold;
	// \hdlname: core trw
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:134.14-134.17
	value<8> p_core_2e_trw;
	// \hdlname: core a3
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:142.14-142.16
	value<3> p_core_2e_a3;
	// \hdlname: core d_bit
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:169.14-169.19
	value<1> p_core_2e_d__bit;
	// \hdlname: core bor_in
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:170.14-170.20
	value<1> p_core_2e_bor__in;
	// \hdlname: core sub_out
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:171.14-171.21
	value<1> p_core_2e_sub__out;
	// \hdlname: core pj
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:175.14-175.16
	value<4> p_core_2e_pj;
	// \hdlname: core pk
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:176.14-176.16
	value<5> p_core_2e_pk;
	// \hdlname: core inc_bit
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:178.14-178.21
	value<1> p_core_2e_inc__bit;
	// \hdlname: core cy_in
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:179.14-179.19
	value<1> p_core_2e_cy__in;
	// \hdlname: core e0
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:254.14-254.16
	value<8> p_core_2e_e0;
	// \hdlname: core e1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:254.18-254.20
	value<8> p_core_2e_e1;
	// \hdlname: core h0
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:255.14-255.16
	value<3> p_core_2e_h0;
	// \hdlname: core h1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:255.18-255.20
	value<3> p_core_2e_h1;
	// \hdlname: core hg
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:268.14-268.16
	value<3> p_core_2e_hg;
	// \hdlname: core act0
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.14-269.18
	value<1> p_core_2e_act0;
	// \hdlname: core act1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.26-269.30
	value<1> p_core_2e_act1;
	// \hdlname: core same0
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:270.14-270.19
	value<1> p_core_2e_same0;
	// \hdlname: core same1
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:271.14-271.19
	value<1> p_core_2e_same1;
	// \hdlname: core pc4
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:290.14-290.17
	value<3> p_core_2e_pc4;
	// \hdlname: core amp
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:303.14-303.17
	value<8> p_core_2e_amp;
	// \hdlname: core w8
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:305.14-305.16
	value<1> p_core_2e_w8;
	// \hdlname: core src
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:307.14-307.17
	value<8> p_core_2e_src;
	// \hdlname: core x
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:308.14-308.15
	value<8> p_core_2e_x;
	// \hdlname: core y
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:320.15-320.16
	value<1> p_core_2e_y;
	// \hdlname: core sd_restart
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:327.15-327.25
	value<1> p_core_2e_sd__restart;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:90.24-90.39
	value<1> i_flatten_5c_core_2e__24_and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_90_24_42__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:103.9-103.18
	value<1> i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_103_24_47__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:133.22-133.46
	value<8> i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_133_24_62__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:135.54-135.61
	value<1> i_flatten_5c_core_2e__24_not_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_135_24_65__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:204.16-204.28
	value<1> i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_204_24_129__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:207.13-207.36
	value<1> i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_207_24_133__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:245.14-245.24
	value<1> i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:246.14-246.23
	value<1> i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_246_24_170__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:247.14-247.23
	value<1> i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_247_24_174__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.21-269.24
	value<1> i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_179__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.33-269.36
	value<1> i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_180__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:323.23-323.62
	value<10> i_flatten_5c_core_2e__24_add_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_323_24_230__Y;
	// \hdlname: spi clk
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:22.23-22.26
	value<1> p_spi_2e_clk;
	// \hdlname: spi hit_cmd
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:29.23-29.30
	value<1> p_spi_2e_hit__cmd;
	// \hdlname: spi active
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:44.14-44.20
	value<1> p_spi_2e_active;
	// \hdlname: spi rise
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:45.14-45.18
	value<1> p_spi_2e_rise;
	// \hdlname: spi last_bit
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:46.14-46.22
	value<1> p_spi_2e_last__bit;
	// \hdlname: spi byte_in
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:47.14-47.21
	value<8> p_spi_2e_byte__in;
	// \hdlname: spi cmd_end
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:48.14-48.21
	value<1> p_spi_2e_cmd__end;
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:67.11-67.18
	value<1> i_flatten_5c_spi_2e__24_logic__not_24_chip_2d_v3_2f_src_2f_uds3__spi_2e_v_3a_67_24_261__Y;
	// \src: chip-v3/src/project.v:26.14-26.20
	value<3> p_hit__ch;
	// \src: chip-v3/src/project.v:25.46-25.51
	value<1> p_audio;
	// connection
	p_core_2e_pj = p_core_2e_t.curr.slice<3,0>().val();
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:176.24-176.57
	// cell $flatten\core.$sub$chip-v3/src/uds3_core.v:176$104
	p_core_2e_pk = sub_uu<5>(value<1>{0u}.concat(p_core_2e_pj).val(), value<2>{0u}.concat(p_core_2e_c__tone.curr.slice<7,5>()).val());
	// connection
	p_core_2e_r = p_core_2e_t.curr.slice<5,3>().val();
	// connection
	p_core_2e_j = p_core_2e_t.curr.slice<2,0>().val();
	// cells $flatten\core.$logic_and$chip-v3/src/uds3_core.v:178$109 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$108 $flatten\core.$logic_and$chip-v3/src/uds3_core.v:178$107 $flatten\core.$le$chip-v3/src/uds3_core.v:178$106 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:178$105
	p_core_2e_inc__bit = logic_and<1>(logic_and<1>(logic_not<1>(p_core_2e_pk.slice<4>().val()), le_uu<1>(p_core_2e_pk.slice<3,0>().val(), value<4>{0x5u})), shiftx_uu<1>(value<1>{0x1u}.concat(p_core_2e_c__tone.curr.slice<4,0>()).val(), p_core_2e_pk.slice<2,0>().val()));
	// connection
	p_core_2e_head = p_core_2e_ring.curr.slice<127>().val();
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:179$111 $flatten\core.$eq$chip-v3/src/uds3_core.v:179$110
	p_core_2e_cy__in = (logic_not<1>(p_core_2e_pj) ? value<1>{0u} : p_core_2e_cy.curr);
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:247.14-247.23
	// cell $flatten\core.$eq$chip-v3/src/uds3_core.v:247$174
	i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_247_24_174__Y = eq_uu<1>(p_core_2e_r, value<3>{0x5u});
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:246.14-246.23
	// cell $flatten\core.$eq$chip-v3/src/uds3_core.v:246$170
	i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_246_24_170__Y = eq_uu<1>(p_core_2e_r, value<3>{0x4u});
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:169$99 $flatten\core.$ternary$chip-v3/src/uds3_core.v:168$95 $flatten\core.$or$chip-v3/src/uds3_core.v:168$92 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:168$94 $flatten\core.$reduce_or$chip-v3/src/uds3_core.v:168$93 $flatten\core.$eq$chip-v3/src/uds3_core.v:169$96 $flatten\core.$and$chip-v3/src/uds3_core.v:169$98 $flatten\core.$le$chip-v3/src/uds3_core.v:169$97
	p_core_2e_d__bit = ((p_core_2e_r.slice<0>().val() ? or_uu<1>(p_core_2e_c__alt8.curr, p_core_2e_c__lin.curr) : logic_not<1>(reduce_or<1>(p_core_2e_c__env.curr.slice<7,3>().val()))) ? logic_not<1>(p_core_2e_j) : and_uu<1>(p_core_2e_ring.curr.slice<124>().val(), le_uu<1>(p_core_2e_j, value<3>{0x4u})));
	// cells $flatten\core.$logic_and$chip-v3/src/uds3_core.v:245$169 $procmux$406 $procmux$407_CMP0 $procmux$408_CMP0 $procmux$409_CMP0 $procmux$410_CMP0 $flatten\core.$ge$chip-v3/src/uds3_core.v:228$150 $flatten\core.$eq$chip-v3/src/uds3_core.v:226$147 $flatten\core.$eq$chip-v3/src/uds3_core.v:225$144 $flatten\core.$or$chip-v3/src/uds3_core.v:224$140 $flatten\core.$eq$chip-v3/src/uds3_core.v:224$139 $flatten\core.$eq$chip-v3/src/uds3_core.v:224$138
	i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y = logic_and<1>(p_core_2e_con.curr, (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x4u}) ? ge_uu<1>(p_core_2e_r, value<3>{0x3u}) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x3u}) ? eq_uu<1>(p_core_2e_r, value<3>{0x2u}) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x2u}) ? eq_uu<1>(p_core_2e_r, value<3>{0x1u}) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x1u}) ? or_uu<1>(logic_not<1>(p_core_2e_r), eq_uu<1>(p_core_2e_r, value<3>{0x4u})) : value<1>{0u})))));
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:170$101 $flatten\core.$eq$chip-v3/src/uds3_core.v:170$100
	p_core_2e_bor__in = (logic_not<1>(p_core_2e_j) ? value<1>{0u} : p_core_2e_bor.curr);
	// connection
	p_hit__ch = p_spi_2e_ch.curr;
	// cells $flatten\core.$xor$chip-v3/src/uds3_core.v:171$103 $flatten\core.$xor$chip-v3/src/uds3_core.v:171$102
	p_core_2e_sub__out = xor_uu<1>(xor_uu<1>(p_core_2e_head, p_core_2e_d__bit), p_core_2e_bor__in);
	// connection
	p_core_2e_hit__ch = p_hit__ch;
	// connection
	p_core_2e_h1.slice<2>() = p_core_2e_ring.curr.slice<33>().val();
	// connection
	p_core_2e_h1.slice<1>() = p_core_2e_ring.curr.slice<34>().val();
	// connection
	p_core_2e_h1.slice<0>() = p_core_2e_ring.curr.slice<35>().val();
	// connection
	p_core_2e_hold = p_spi_2e_rx.curr;
	// connection
	p_core_2e_e1.slice<7>() = p_core_2e_ring.curr.slice<23>().val();
	// connection
	p_core_2e_e1.slice<6>() = p_core_2e_ring.curr.slice<24>().val();
	// connection
	p_core_2e_e1.slice<5>() = p_core_2e_ring.curr.slice<25>().val();
	// connection
	p_core_2e_e1.slice<4>() = p_core_2e_ring.curr.slice<26>().val();
	// connection
	p_core_2e_e1.slice<3>() = p_core_2e_ring.curr.slice<27>().val();
	// connection
	p_core_2e_e1.slice<2>() = p_core_2e_ring.curr.slice<28>().val();
	// connection
	p_core_2e_e1.slice<1>() = p_core_2e_ring.curr.slice<29>().val();
	// connection
	p_core_2e_e1.slice<0>() = p_core_2e_ring.curr.slice<30>().val();
	// connection
	p_core_2e_h0.slice<2>() = p_core_2e_ring.curr.slice<97>().val();
	// connection
	p_core_2e_h0.slice<1>() = p_core_2e_ring.curr.slice<98>().val();
	// connection
	p_core_2e_h0.slice<0>() = p_core_2e_ring.curr.slice<99>().val();
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:268$178 $flatten\core.$eq$chip-v3/src/uds3_core.v:268$177
	p_core_2e_hg = (eq_uu<1>(p_core_2e_hit__ch, value<3>{0x7u}) ? value<3>{0x6u} : p_core_2e_hit__ch);
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.33-269.36
	// cell $flatten\core.$reduce_or$chip-v3/src/uds3_core.v:269$180
	i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_180__Y = reduce_or<1>(p_core_2e_e1);
	// connection
	p_core_2e_e0.slice<7>() = p_core_2e_ring.curr.slice<87>().val();
	// connection
	p_core_2e_e0.slice<6>() = p_core_2e_ring.curr.slice<88>().val();
	// connection
	p_core_2e_e0.slice<5>() = p_core_2e_ring.curr.slice<89>().val();
	// connection
	p_core_2e_e0.slice<4>() = p_core_2e_ring.curr.slice<90>().val();
	// connection
	p_core_2e_e0.slice<3>() = p_core_2e_ring.curr.slice<91>().val();
	// connection
	p_core_2e_e0.slice<2>() = p_core_2e_ring.curr.slice<92>().val();
	// connection
	p_core_2e_e0.slice<1>() = p_core_2e_ring.curr.slice<93>().val();
	// connection
	p_core_2e_e0.slice<0>() = p_core_2e_ring.curr.slice<94>().val();
	// connection
	p_core_2e_act1 = i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_180__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.21-269.24
	// cell $flatten\core.$reduce_or$chip-v3/src/uds3_core.v:269$179
	i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_179__Y = reduce_or<1>(p_core_2e_e0);
	// connection
	p_core_2e_act0 = i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_179__Y;
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:44.25-44.33
	// cell $flatten\spi.$logic_not$chip-v3/src/uds3_spi.v:44$241
	p_spi_2e_active = logic_not<1>(p_spi_2e_cs__s.curr.slice<1>().val());
	// cells $flatten\core.$logic_and$chip-v3/src/uds3_core.v:271$188 $flatten\core.$eq$chip-v3/src/uds3_core.v:271$187 $flatten\core.$ternary$chip-v3/src/uds3_core.v:271$186 $flatten\core.$eq$chip-v3/src/uds3_core.v:271$185
	p_core_2e_same1 = logic_and<1>(p_core_2e_act1, eq_uu<1>((eq_uu<1>(p_core_2e_h1, value<3>{0x7u}) ? value<3>{0x6u} : p_core_2e_h1), p_core_2e_hg));
	// cells $flatten\core.$logic_and$chip-v3/src/uds3_core.v:270$184 $flatten\core.$eq$chip-v3/src/uds3_core.v:270$183 $flatten\core.$ternary$chip-v3/src/uds3_core.v:270$182 $flatten\core.$eq$chip-v3/src/uds3_core.v:270$181
	p_core_2e_same0 = logic_and<1>(p_core_2e_act0, eq_uu<1>((eq_uu<1>(p_core_2e_h0, value<3>{0x7u}) ? value<3>{0x6u} : p_core_2e_h0), p_core_2e_hg));
	// cells $flatten\core.$add$chip-v3/src/uds3_core.v:290$198 $flatten\core.$add$chip-v3/src/uds3_core.v:290$197 $flatten\core.$add$chip-v3/src/uds3_core.v:290$196
	p_core_2e_pc4 = add_uu<3>(add_uu<3>(add_uu<3>(value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<0>()).val(), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<1>()).val()), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<2>()).val()), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<3>()).val());
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:45$244 $flatten\spi.$logic_not$chip-v3/src/uds3_spi.v:45$243 $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:45$242
	p_spi_2e_rise = logic_and<1>(logic_and<1>(p_spi_2e_active, p_spi_2e_sck__s.curr.slice<1>().val()), logic_not<1>(p_spi_2e_sck__s.curr.slice<2>().val()));
	// connection
	p_core_2e_amp = p_core_2e_c__env.curr;
	// connection
	p_core_2e_nw.slice<63>() = p_core_2e_ring.curr.slice<63>().val();
	// connection
	p_core_2e_nw.slice<62>() = p_core_2e_ring.curr.slice<64>().val();
	// connection
	p_core_2e_nw.slice<61>() = p_core_2e_ring.curr.slice<65>().val();
	// connection
	p_core_2e_nw.slice<60>() = p_core_2e_ring.curr.slice<66>().val();
	// connection
	p_core_2e_nw.slice<59>() = p_core_2e_ring.curr.slice<67>().val();
	// connection
	p_core_2e_nw.slice<58>() = p_core_2e_ring.curr.slice<68>().val();
	// connection
	p_core_2e_nw.slice<57>() = p_core_2e_ring.curr.slice<69>().val();
	// connection
	p_core_2e_nw.slice<56>() = p_core_2e_ring.curr.slice<70>().val();
	// connection
	p_core_2e_nw.slice<55>() = p_core_2e_ring.curr.slice<71>().val();
	// connection
	p_core_2e_nw.slice<54>() = p_core_2e_ring.curr.slice<72>().val();
	// connection
	p_core_2e_nw.slice<53>() = p_core_2e_ring.curr.slice<73>().val();
	// connection
	p_core_2e_nw.slice<52>() = p_core_2e_ring.curr.slice<74>().val();
	// connection
	p_core_2e_nw.slice<51>() = p_core_2e_ring.curr.slice<75>().val();
	// connection
	p_core_2e_nw.slice<50>() = p_core_2e_ring.curr.slice<76>().val();
	// connection
	p_core_2e_nw.slice<49>() = p_core_2e_ring.curr.slice<77>().val();
	// connection
	p_core_2e_nw.slice<48>() = p_core_2e_ring.curr.slice<78>().val();
	// connection
	p_core_2e_nw.slice<47>() = p_core_2e_ring.curr.slice<79>().val();
	// connection
	p_core_2e_nw.slice<46>() = p_core_2e_ring.curr.slice<80>().val();
	// connection
	p_core_2e_nw.slice<45>() = p_core_2e_ring.curr.slice<81>().val();
	// connection
	p_core_2e_nw.slice<44>() = p_core_2e_ring.curr.slice<82>().val();
	// connection
	p_core_2e_nw.slice<43>() = p_core_2e_ring.curr.slice<83>().val();
	// connection
	p_core_2e_nw.slice<42>() = p_core_2e_ring.curr.slice<84>().val();
	// connection
	p_core_2e_nw.slice<41>() = p_core_2e_ring.curr.slice<85>().val();
	// connection
	p_core_2e_nw.slice<40>() = p_core_2e_ring.curr.slice<86>().val();
	// connection
	p_core_2e_nw.slice<39>() = p_core_2e_ring.curr.slice<87>().val();
	// connection
	p_core_2e_nw.slice<38>() = p_core_2e_ring.curr.slice<88>().val();
	// connection
	p_core_2e_nw.slice<37>() = p_core_2e_ring.curr.slice<89>().val();
	// connection
	p_core_2e_nw.slice<36>() = p_core_2e_ring.curr.slice<90>().val();
	// connection
	p_core_2e_nw.slice<35>() = p_core_2e_ring.curr.slice<91>().val();
	// connection
	p_core_2e_nw.slice<34>() = p_core_2e_ring.curr.slice<92>().val();
	// connection
	p_core_2e_nw.slice<33>() = p_core_2e_ring.curr.slice<93>().val();
	// connection
	p_core_2e_nw.slice<32>() = p_core_2e_ring.curr.slice<94>().val();
	// connection
	p_core_2e_nw.slice<31>() = p_core_2e_ring.curr.slice<95>().val();
	// connection
	p_core_2e_nw.slice<30>() = p_core_2e_ring.curr.slice<96>().val();
	// connection
	p_core_2e_nw.slice<29>() = p_core_2e_ring.curr.slice<97>().val();
	// connection
	p_core_2e_nw.slice<28>() = p_core_2e_ring.curr.slice<98>().val();
	// connection
	p_core_2e_nw.slice<27>() = p_core_2e_ring.curr.slice<99>().val();
	// connection
	p_core_2e_nw.slice<26>() = p_core_2e_ring.curr.slice<100>().val();
	// connection
	p_core_2e_nw.slice<25>() = p_core_2e_ring.curr.slice<101>().val();
	// connection
	p_core_2e_nw.slice<24>() = p_core_2e_ring.curr.slice<102>().val();
	// connection
	p_core_2e_nw.slice<23>() = p_core_2e_ring.curr.slice<103>().val();
	// connection
	p_core_2e_nw.slice<22>() = p_core_2e_ring.curr.slice<104>().val();
	// connection
	p_core_2e_nw.slice<21>() = p_core_2e_ring.curr.slice<105>().val();
	// connection
	p_core_2e_nw.slice<20>() = p_core_2e_ring.curr.slice<106>().val();
	// connection
	p_core_2e_nw.slice<19>() = p_core_2e_ring.curr.slice<107>().val();
	// connection
	p_core_2e_nw.slice<18>() = p_core_2e_ring.curr.slice<108>().val();
	// connection
	p_core_2e_nw.slice<17>() = p_core_2e_ring.curr.slice<109>().val();
	// connection
	p_core_2e_nw.slice<16>() = p_core_2e_ring.curr.slice<110>().val();
	// connection
	p_core_2e_nw.slice<15>() = p_core_2e_ring.curr.slice<111>().val();
	// connection
	p_core_2e_nw.slice<14>() = p_core_2e_ring.curr.slice<112>().val();
	// connection
	p_core_2e_nw.slice<13>() = p_core_2e_ring.curr.slice<113>().val();
	// connection
	p_core_2e_nw.slice<12>() = p_core_2e_ring.curr.slice<114>().val();
	// connection
	p_core_2e_nw.slice<11>() = p_core_2e_ring.curr.slice<115>().val();
	// connection
	p_core_2e_nw.slice<10>() = p_core_2e_ring.curr.slice<116>().val();
	// connection
	p_core_2e_nw.slice<9>() = p_core_2e_ring.curr.slice<117>().val();
	// connection
	p_core_2e_nw.slice<8>() = p_core_2e_ring.curr.slice<118>().val();
	// connection
	p_core_2e_nw.slice<7>() = p_core_2e_ring.curr.slice<119>().val();
	// connection
	p_core_2e_nw.slice<6>() = p_core_2e_ring.curr.slice<120>().val();
	// connection
	p_core_2e_nw.slice<5>() = p_core_2e_ring.curr.slice<121>().val();
	// connection
	p_core_2e_nw.slice<4>() = p_core_2e_ring.curr.slice<122>().val();
	// connection
	p_core_2e_nw.slice<3>() = p_core_2e_ring.curr.slice<123>().val();
	// connection
	p_core_2e_nw.slice<2>() = p_core_2e_ring.curr.slice<124>().val();
	// connection
	p_core_2e_nw.slice<1>() = p_core_2e_ring.curr.slice<125>().val();
	// connection
	p_core_2e_nw.slice<0>() = p_core_2e_ring.curr.slice<126>().val();
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:46$246 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:46$245
	p_spi_2e_last__bit = logic_and<1>(p_spi_2e_rise, eq_uu<1>(p_spi_2e_bitcnt.curr, value<3>{0x7u}));
	// connection
	p_core_2e_n__ph = p_core_2e_nw.slice<63,54>().val();
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:305.22-305.42
	// cell $flatten\core.$lt$chip-v3/src/uds3_core.v:305$218
	p_core_2e_w8 = lt_uu<1>(p_core_2e_t.curr, value<1>{0u}.concat(p_core_2e_amp.slice<7,3>()).val());
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:133.22-133.46
	// cell $flatten\core.$xor$chip-v3/src/uds3_core.v:133$62
	i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_133_24_62__Y = xor_uu<8>(p_core_2e_n__ph.slice<8,1>().val(), p_core_2e_n__ph.slice<9>().val().repeat<8>().val());
	// cells $procmux$454 $procmux$451 $procmux$448 $procmux$400 $procmux$401_CMP0 $procmux$402_CMP0 $procmux$403_CMP0 $procmux$404_CMP0 $procmux$397 $procmux$398_CMP0 $procmux$393 $procmux$394_CMP0 $procmux$395_CMP0 $procmux$396_CMP0 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$162 $flatten\core.$add$chip-v3/src/uds3_core.v:233$161 $flatten\core.$ternary$chip-v3/src/uds3_core.v:230$160 $flatten\core.$lt$chip-v3/src/uds3_core.v:230$151 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$153 $flatten\core.$not$chip-v3/src/uds3_core.v:230$152 $flatten\core.$ternary$chip-v3/src/uds3_core.v:231$159 $flatten\core.$eq$chip-v3/src/uds3_core.v:231$154 $flatten\core.$ternary$chip-v3/src/uds3_core.v:231$158 $flatten\core.$eq$chip-v3/src/uds3_core.v:231$155 $flatten\core.$ternary$chip-v3/src/uds3_core.v:232$157 $flatten\core.$eq$chip-v3/src/uds3_core.v:232$156 $flatten\core.$ternary$chip-v3/src/uds3_core.v:235$167 $flatten\core.$eq$chip-v3/src/uds3_core.v:235$163 $flatten\core.$not$chip-v3/src/uds3_core.v:235$164 $flatten\core.$ternary$chip-v3/src/uds3_core.v:236$166 $flatten\core.$eq$chip-v3/src/uds3_core.v:236$165 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$149 $flatten\core.$not$chip-v3/src/uds3_core.v:226$148 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$146 $flatten\core.$not$chip-v3/src/uds3_core.v:225$145 $flatten\core.$ternary$chip-v3/src/uds3_core.v:224$143 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$142 $flatten\core.$not$chip-v3/src/uds3_core.v:224$141 $procmux$445 $procmux$442 $procmux$439 $flatten\core.$logic_and$chip-v3/src/uds3_core.v:246$173 $flatten\core.$ternary$chip-v3/src/uds3_core.v:246$172 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:246$171 $procmux$436 $procmux$433 $procmux$430 $procmux$427 $flatten\core.$ternary$chip-v3/src/uds3_core.v:247$175 $procmux$424 $procmux$421 $procmux$418 $procmux$415 $procmux$412 $flatten\core.$eq$chip-v3/src/uds3_core.v:248$176 $flatten\core.$xor$chip-v3/src/uds3_core.v:180$113 $flatten\core.$xor$chip-v3/src/uds3_core.v:180$112
	i_procmux_24_454__Y = (p_core_2e_clearing.curr ? value<1>{0u} : (p_core_2e_clearing.curr ? value<1>{0u} : (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y ? (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x4u}) ? (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x4u}) ? (eq_uu<1>(p_core_2e_r, value<3>{0x5u}) ? value<1>{0x1u} : (eq_uu<1>(p_core_2e_r, value<3>{0x4u}) ? shiftx_uu<1>(p_core_2e_hold, add_uu<3>(value<1>{0u}.concat(p_core_2e_j.slice<1,0>()).val(), value<3>{0x1u})) : (eq_uu<1>(p_core_2e_r, value<3>{0x3u}) ? (lt_uu<1>(p_core_2e_j, value<3>{0x3u}) ? shiftx_uu<1>(p_core_2e_hold, not_u<3>(p_core_2e_j)) : (eq_uu<1>(p_core_2e_j, value<3>{0x3u}) ? p_core_2e_hit__ch.slice<0>().val() : (eq_uu<1>(p_core_2e_j, value<3>{0x4u}) ? p_core_2e_hit__ch.slice<1>().val() : (eq_uu<1>(p_core_2e_j, value<3>{0x5u}) ? p_core_2e_hit__ch.slice<2>().val() : value<1>{0u})))) : (eq_uu<1>(p_core_2e_t.curr.slice<3,0>().val(), value<4>{0xeu}) ? not_u<1>(p_core_2e_hold.slice<0>().val()) : (eq_uu<1>(p_core_2e_t.curr.slice<3,0>().val(), value<4>{0xfu}) ? p_core_2e_hold.slice<0>().val() : value<1>{0u}))))) : value<1>{0u}) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x3u}) ? shiftx_uu<1>(p_core_2e_hold, not_u<3>(p_core_2e_j)) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x2u}) ? shiftx_uu<1>(p_core_2e_hold, not_u<3>(p_core_2e_j)) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x1u}) ? (p_core_2e_r.slice<2>().val() ? value<1>{0u} : shiftx_uu<1>(p_core_2e_hold, not_u<3>(p_core_2e_j))) : value<1>{0u})))) : (p_core_2e_clearing.curr ? value<1>{0u} : (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y ? value<1>{0u} : (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_246_24_170__Y ? logic_and<1>(logic_not<1>(p_core_2e_kill.curr), (p_core_2e_c__dec.curr ? p_core_2e_sub__out : p_core_2e_head)) : (p_core_2e_clearing.curr ? value<1>{0u} : (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y ? value<1>{0u} : (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_246_24_170__Y ? value<1>{0u} : (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_247_24_174__Y ? (p_core_2e_c__adec.curr ? p_core_2e_sub__out : p_core_2e_head) : (p_core_2e_clearing.curr ? value<1>{0u} : (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y ? value<1>{0u} : (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_246_24_170__Y ? value<1>{0u} : (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_247_24_174__Y ? value<1>{0u} : (eq_uu<1>(p_core_2e_t.curr.slice<5,4>().val(), value<2>{0x3u}) ? xor_uu<1>(xor_uu<1>(p_core_2e_head, p_core_2e_inc__bit), p_core_2e_cy__in) : p_core_2e_ring.curr.slice<127>().val())))))))))))))));
	// connection
	p_core_2e_fold = i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_133_24_62__Y;
	// connection
	p_spi_2e_byte__in = p_spi_2e_rx.curr.slice<6,0>().concat(p_spi_2e_mosi__s.curr).val();
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:307$223 $flatten\core.$or$chip-v3/src/uds3_core.v:302$216 $flatten\core.$lt$chip-v3/src/uds3_core.v:302$215 $flatten\core.$reduce_and$chip-v3/src/uds3_core.v:302$214 $flatten\core.$ternary$chip-v3/src/uds3_core.v:295$213 $flatten\core.$eq$chip-v3/src/uds3_core.v:295$208 $flatten\core.$ternary$chip-v3/src/uds3_core.v:291$200 $flatten\core.$not$chip-v3/src/uds3_core.v:291$199 $flatten\core.$ternary$chip-v3/src/uds3_core.v:295$212 $flatten\core.$eq$chip-v3/src/uds3_core.v:295$209 $flatten\core.$ternary$chip-v3/src/uds3_core.v:292$201 $flatten\core.$ternary$chip-v3/src/uds3_core.v:296$211 $flatten\core.$eq$chip-v3/src/uds3_core.v:296$210 $flatten\core.$ternary$chip-v3/src/uds3_core.v:293$204 $flatten\core.$eq$chip-v3/src/uds3_core.v:293$202 $flatten\core.$ternary$chip-v3/src/uds3_core.v:293$203 $flatten\core.$ternary$chip-v3/src/uds3_core.v:294$207 $flatten\core.$xor$chip-v3/src/uds3_core.v:294$206 $flatten\core.$xor$chip-v3/src/uds3_core.v:294$205 $flatten\core.$ternary$chip-v3/src/uds3_core.v:307$222
	p_core_2e_src = (or_uu<1>(reduce_and<1>(p_core_2e_c__mix.curr), lt_uu<1>(p_core_2e_t.curr.slice<0>().concat(p_core_2e_t.curr.slice<1>()).concat(p_core_2e_t.curr.slice<2>()).val(), p_core_2e_c__mix.curr)) ? (logic_not<1>(p_core_2e_c__color.curr) ? (p_core_2e_pc4.slice<2>().val() ? value<8>{0x7fu} : not_u<1>(p_core_2e_pc4.slice<1>().val()).concat(p_core_2e_pc4.slice<0>()).concat(value<6>{0u}).val()) : (eq_uu<1>(p_core_2e_c__color.curr, value<2>{0x1u}) ? (p_core_2e_lfsr.curr.slice<0>().val() ? value<8>{0x7fu} : value<8>{0x80u}) : (eq_uu<1>(p_core_2e_c__color.curr, value<2>{0x2u}) ? (eq_uu<1>(p_core_2e_lfsr.curr.slice<0>().val(), p_core_2e_lfsr.curr.slice<1>().val()) ? value<8>{0u} : (p_core_2e_lfsr.curr.slice<0>().val() ? value<8>{0x7fu} : value<8>{0x80u})) : (xor_uu<1>(xor_uu<1>(p_core_2e_frame.curr.slice<1>().val(), p_core_2e_frame.curr.slice<3>().val()), p_core_2e_frame.curr.slice<4>().val()) ? value<8>{0x7fu} : value<8>{0x80u})))) : (p_core_2e_c__clap.curr ? value<8>{0u} : p_core_2e_c__tone.curr));
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:55.22-55.24
	// cell $flatten\core.$reduce_and$chip-v3/src/uds3_core.v:55$36
	p_core_2e_wend = reduce_and<1>(p_core_2e_t.curr);
	// connection
	p_core_2e_w0.slice<63>() = p_core_2e_ring.curr.slice<64>().val();
	// connection
	p_core_2e_w0.slice<62>() = p_core_2e_ring.curr.slice<65>().val();
	// connection
	p_core_2e_w0.slice<61>() = p_core_2e_ring.curr.slice<66>().val();
	// connection
	p_core_2e_w0.slice<60>() = p_core_2e_ring.curr.slice<67>().val();
	// connection
	p_core_2e_w0.slice<59>() = p_core_2e_ring.curr.slice<68>().val();
	// connection
	p_core_2e_w0.slice<58>() = p_core_2e_ring.curr.slice<69>().val();
	// connection
	p_core_2e_w0.slice<57>() = p_core_2e_ring.curr.slice<70>().val();
	// connection
	p_core_2e_w0.slice<56>() = p_core_2e_ring.curr.slice<71>().val();
	// connection
	p_core_2e_w0.slice<55>() = p_core_2e_ring.curr.slice<72>().val();
	// connection
	p_core_2e_w0.slice<54>() = p_core_2e_ring.curr.slice<73>().val();
	// connection
	p_core_2e_w0.slice<53>() = p_core_2e_ring.curr.slice<74>().val();
	// connection
	p_core_2e_w0.slice<52>() = p_core_2e_ring.curr.slice<75>().val();
	// connection
	p_core_2e_w0.slice<51>() = p_core_2e_ring.curr.slice<76>().val();
	// connection
	p_core_2e_w0.slice<50>() = p_core_2e_ring.curr.slice<77>().val();
	// connection
	p_core_2e_w0.slice<49>() = p_core_2e_ring.curr.slice<78>().val();
	// connection
	p_core_2e_w0.slice<48>() = p_core_2e_ring.curr.slice<79>().val();
	// connection
	p_core_2e_w0.slice<47>() = p_core_2e_ring.curr.slice<80>().val();
	// connection
	p_core_2e_w0.slice<46>() = p_core_2e_ring.curr.slice<81>().val();
	// connection
	p_core_2e_w0.slice<45>() = p_core_2e_ring.curr.slice<82>().val();
	// connection
	p_core_2e_w0.slice<44>() = p_core_2e_ring.curr.slice<83>().val();
	// connection
	p_core_2e_w0.slice<43>() = p_core_2e_ring.curr.slice<84>().val();
	// connection
	p_core_2e_w0.slice<42>() = p_core_2e_ring.curr.slice<85>().val();
	// connection
	p_core_2e_w0.slice<41>() = p_core_2e_ring.curr.slice<86>().val();
	// connection
	p_core_2e_w0.slice<40>() = p_core_2e_ring.curr.slice<87>().val();
	// connection
	p_core_2e_w0.slice<39>() = p_core_2e_ring.curr.slice<88>().val();
	// connection
	p_core_2e_w0.slice<38>() = p_core_2e_ring.curr.slice<89>().val();
	// connection
	p_core_2e_w0.slice<37>() = p_core_2e_ring.curr.slice<90>().val();
	// connection
	p_core_2e_w0.slice<36>() = p_core_2e_ring.curr.slice<91>().val();
	// connection
	p_core_2e_w0.slice<35>() = p_core_2e_ring.curr.slice<92>().val();
	// connection
	p_core_2e_w0.slice<34>() = p_core_2e_ring.curr.slice<93>().val();
	// connection
	p_core_2e_w0.slice<33>() = p_core_2e_ring.curr.slice<94>().val();
	// connection
	p_core_2e_w0.slice<32>() = p_core_2e_ring.curr.slice<95>().val();
	// connection
	p_core_2e_w0.slice<31>() = p_core_2e_ring.curr.slice<96>().val();
	// connection
	p_core_2e_w0.slice<30>() = p_core_2e_ring.curr.slice<97>().val();
	// connection
	p_core_2e_w0.slice<29>() = p_core_2e_ring.curr.slice<98>().val();
	// connection
	p_core_2e_w0.slice<28>() = p_core_2e_ring.curr.slice<99>().val();
	// connection
	p_core_2e_w0.slice<27>() = p_core_2e_ring.curr.slice<100>().val();
	// connection
	p_core_2e_w0.slice<26>() = p_core_2e_ring.curr.slice<101>().val();
	// connection
	p_core_2e_w0.slice<25>() = p_core_2e_ring.curr.slice<102>().val();
	// connection
	p_core_2e_w0.slice<24>() = p_core_2e_ring.curr.slice<103>().val();
	// connection
	p_core_2e_w0.slice<23>() = p_core_2e_ring.curr.slice<104>().val();
	// connection
	p_core_2e_w0.slice<22>() = p_core_2e_ring.curr.slice<105>().val();
	// connection
	p_core_2e_w0.slice<21>() = p_core_2e_ring.curr.slice<106>().val();
	// connection
	p_core_2e_w0.slice<20>() = p_core_2e_ring.curr.slice<107>().val();
	// connection
	p_core_2e_w0.slice<19>() = p_core_2e_ring.curr.slice<108>().val();
	// connection
	p_core_2e_w0.slice<18>() = p_core_2e_ring.curr.slice<109>().val();
	// connection
	p_core_2e_w0.slice<17>() = p_core_2e_ring.curr.slice<110>().val();
	// connection
	p_core_2e_w0.slice<16>() = p_core_2e_ring.curr.slice<111>().val();
	// connection
	p_core_2e_w0.slice<15>() = p_core_2e_ring.curr.slice<112>().val();
	// connection
	p_core_2e_w0.slice<14>() = p_core_2e_ring.curr.slice<113>().val();
	// connection
	p_core_2e_w0.slice<13>() = p_core_2e_ring.curr.slice<114>().val();
	// connection
	p_core_2e_w0.slice<12>() = p_core_2e_ring.curr.slice<115>().val();
	// connection
	p_core_2e_w0.slice<11>() = p_core_2e_ring.curr.slice<116>().val();
	// connection
	p_core_2e_w0.slice<10>() = p_core_2e_ring.curr.slice<117>().val();
	// connection
	p_core_2e_w0.slice<9>() = p_core_2e_ring.curr.slice<118>().val();
	// connection
	p_core_2e_w0.slice<8>() = p_core_2e_ring.curr.slice<119>().val();
	// connection
	p_core_2e_w0.slice<7>() = p_core_2e_ring.curr.slice<120>().val();
	// connection
	p_core_2e_w0.slice<6>() = p_core_2e_ring.curr.slice<121>().val();
	// connection
	p_core_2e_w0.slice<5>() = p_core_2e_ring.curr.slice<122>().val();
	// connection
	p_core_2e_w0.slice<4>() = p_core_2e_ring.curr.slice<123>().val();
	// connection
	p_core_2e_w0.slice<3>() = p_core_2e_ring.curr.slice<124>().val();
	// connection
	p_core_2e_w0.slice<2>() = p_core_2e_ring.curr.slice<125>().val();
	// connection
	p_core_2e_w0.slice<1>() = p_core_2e_ring.curr.slice<126>().val();
	// connection
	p_core_2e_w0.slice<0>() = p_core_2e_ring.curr.slice<127>().val();
	// connection
	p_core_2e_p__aux = i_procmux_24_454__Y.concat(p_core_2e_ring.curr.slice<0>()).concat(p_core_2e_ring.curr.slice<1>()).concat(p_core_2e_ring.curr.slice<2>()).concat(p_core_2e_ring.curr.slice<3>()).concat(p_core_2e_ring.curr.slice<4>()).concat(p_core_2e_ring.curr.slice<5>()).concat(p_core_2e_ring.curr.slice<6>()).val();
	// connection
	p_core_2e_p__bend = p_core_2e_ring.curr.slice<30,29>().val();
	// connection
	p_core_2e_n__wave = p_core_2e_nw.slice<12>().concat(p_core_2e_nw.slice<13>()).val();
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:134.23-134.31
	// cell $flatten\core.$not$chip-v3/src/uds3_core.v:134$63
	p_core_2e_trw = not_u<1>(p_core_2e_fold.slice<7>().val()).concat(p_core_2e_fold.slice<6,0>()).val();
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:48$248 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:48$247
	p_spi_2e_cmd__end = logic_and<1>(p_spi_2e_last__bit, logic_not<1>(p_spi_2e_bytecnt.curr));
	// connection
	p_core_2e_z__bt = p_core_2e_w0.slice<19>().concat(p_core_2e_w0.slice<20>()).concat(p_core_2e_w0.slice<21>()).val();
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:90.24-90.39
	// cell $flatten\core.$and$chip-v3/src/uds3_core.v:90$42
	i_flatten_5c_core_2e__24_and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_90_24_42__Y = and_uu<1>(p_core_2e_w0.slice<22>().val(), p_core_2e_w0.slice<23>().val());
	// connection
	i_flatten_5c_core_2e__24_not_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_135_24_65__Y = i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_133_24_62__Y.slice<7>().val();
	// connection
	p_core_2e_n__aux = p_core_2e_nw.slice<47,40>().val();
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:52$257 $flatten\spi.$le$chip-v3/src/uds3_spi.v:52$256 $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:52$255 $flatten\spi.$ne$chip-v3/src/uds3_spi.v:52$254 $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:52$253
	p_core_2e_byte__done = logic_and<1>(logic_and<1>(logic_and<1>(p_spi_2e_last__bit, p_spi_2e_is__hit.curr), reduce_bool<1>(p_spi_2e_bytecnt.curr)), le_uu<1>(p_spi_2e_bytecnt.curr, value<3>{0x4u}));
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:56.22-56.30
	// cell $flatten\core.$and$chip-v3/src/uds3_core.v:56$37
	p_core_2e_fend = and_uu<1>(p_core_2e_wend, p_core_2e_v.curr);
	// connection
	p_core_2e_n__mix = p_core_2e_nw.slice<24>().concat(p_core_2e_nw.slice<25>()).concat(p_core_2e_nw.slice<26>()).val();
	// connection
	p_core_2e_n__mode = p_core_2e_nw.slice<22>().concat(p_core_2e_nw.slice<23>()).val();
	// connection
	p_core_2e_a3 = p_core_2e_n__aux.slice<7,5>().val();
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:50$250 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:50$249
	p_spi_2e_hit__cmd = logic_and<1>(p_spi_2e_cmd__end, eq_uu<1>(p_spi_2e_byte__in.slice<7,3>().val(), value<5>{0x3u}));
	// connection
	i_flatten_5c_spi_2e__24_logic__not_24_chip_2d_v3_2f_src_2f_uds3__spi_2e_v_3a_67_24_261__Y = p_spi_2e_cs__s.curr.slice<1>().val();
	// cells $procmux$282 $procmux$285 $procmux$288 $procmux$291 $procmux$294 $procmux$297 $procmux$300 $procmux$303 $procmux$306 $procmux$309 $procmux$312 $procmux$315 $procmux$318
	p_core_2e_tz = (p_core_2e_frame.curr.slice<0>().val() ? value<4>{0u} : (p_core_2e_frame.curr.slice<1>().val() ? value<4>{0x1u} : (p_core_2e_frame.curr.slice<2>().val() ? value<4>{0x2u} : (p_core_2e_frame.curr.slice<3>().val() ? value<4>{0x3u} : (p_core_2e_frame.curr.slice<4>().val() ? value<4>{0x4u} : (p_core_2e_frame.curr.slice<5>().val() ? value<4>{0x5u} : (p_core_2e_frame.curr.slice<6>().val() ? value<4>{0x6u} : (p_core_2e_frame.curr.slice<7>().val() ? value<4>{0x7u} : (p_core_2e_frame.curr.slice<8>().val() ? value<4>{0x8u} : (p_core_2e_frame.curr.slice<9>().val() ? value<4>{0x9u} : (p_core_2e_frame.curr.slice<10>().val() ? value<4>{0xau} : (p_core_2e_frame.curr.slice<11>().val() ? value<4>{0xbu} : (p_core_2e_frame.curr.slice<12>().val() ? value<4>{0xcu} : value<4>{0xdu})))))))))))));
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:204.16-204.28
	// cell $flatten\core.$logic_and$chip-v3/src/uds3_core.v:204$129
	i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_204_24_129__Y = logic_and<1>(p_core_2e_fend, p_core_2e_pend.curr);
	// \src: chip-v3/src/uds3_core.v:205.7-205.59
	// cell $procmux$363
	i_procmux_24_363__Y = (p_core_2e_byte__done ? value<1>{0x1u} : p_core_2e_hv.curr);
	// cells $flatten\core.$logic_and$chip-v3/src/uds3_core.v:207$133 $flatten\core.$ne$chip-v3/src/uds3_core.v:207$132 $flatten\core.$logic_and$chip-v3/src/uds3_core.v:207$131 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:207$130
	i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_207_24_133__Y = logic_and<1>(logic_and<1>(p_core_2e_hv.curr, logic_not<1>(p_core_2e_pend.curr)), ne_uu<1>(p_core_2e_v.curr, p_core_2e_tgt.curr));
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:308$226 $flatten\core.$ternary$chip-v3/src/uds3_core.v:309$225 $flatten\core.$ternary$chip-v3/src/uds3_core.v:310$224 $flatten\core.$logic_and$chip-v3/src/uds3_core.v:306$221 $flatten\core.$lt$chip-v3/src/uds3_core.v:306$220 $flatten\core.$add$chip-v3/src/uds3_core.v:304$217 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:306$219
	p_core_2e_x = (p_core_2e_clearing.curr ? value<8>{0u} : (p_core_2e_w8 ? p_core_2e_src : (logic_and<1>(logic_not<1>(p_core_2e_w8), lt_uu<1>(p_core_2e_t.curr, add_uu<6>(value<1>{0u}.concat(p_core_2e_amp.slice<7,3>()).val(), value<3>{0u}.concat(p_core_2e_amp.slice<2,0>()).val()))) ? p_core_2e_src.slice<7>().val().repeat<3>().concat(p_core_2e_src.slice<7,3>()).val() : value<8>{0u})));
	// connection
	p_core_2e_z__aux = p_core_2e_w0.slice<47,40>().val();
	// connection
	p_core_2e_hit__cmd = p_spi_2e_hit__cmd;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:320.23-320.33
	// cell $flatten\core.$not$chip-v3/src/uds3_core.v:320$227
	p_core_2e_y = not_u<1>(p_core_2e_sd__v2.curr.slice<11>().val());
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:323.23-323.62
	// cell $flatten\core.$add$chip-v3/src/uds3_core.v:323$230
	i_flatten_5c_core_2e__24_add_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_323_24_230__Y = add_uu<10>(value<1>{0u}.concat(p_core_2e_sd__v2.curr.slice<8,0>()).val(), value<1>{0u}.concat(p_core_2e_sd__v1.curr.slice<8,0>()).val());
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:103.9-103.18
	// cell $flatten\core.$eq$chip-v3/src/uds3_core.v:103$47
	i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_103_24_47__Y = logic_not<1>(p_core_2e_t.curr);
	// cells $flatten\core.$add$chip-v3/src/uds3_core.v:129$60 $flatten\core.$add$chip-v3/src/uds3_core.v:128$59 $flatten\core.$and$chip-v3/src/uds3_core.v:128$58 $flatten\core.$and$chip-v3/src/uds3_core.v:128$57
	p_core_2e_pe__raw = add_uu<9>(value<1>{0u}.concat(p_core_2e_ring.curr.slice<46,39>()).val(), value<2>{0u}.concat(add_uu<8>(and_uu<8>(p_core_2e_p__bend.slice<1>().val().repeat<8>().val(), value<1>{0u}.concat(p_core_2e_p__aux.slice<7,1>()).val()), and_uu<8>(p_core_2e_p__bend.slice<0>().val().repeat<8>().val(), value<2>{0u}.concat(p_core_2e_p__aux.slice<7,2>()).val())).slice<7,1>()).val());
	// cells $flatten\core.$logic_or$chip-v3/src/uds3_core.v:327$239 $flatten\core.$logic_and$chip-v3/src/uds3_core.v:327$238 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:327$237 $flatten\core.$logic_and$chip-v3/src/uds3_core.v:327$236 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:327$235 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:327$234
	p_core_2e_sd__restart = logic_or<1>(logic_not<1>(p_rst__n), logic_and<1>(logic_and<1>(p_core_2e_fend, logic_not<1>(p_core_2e_act0)), logic_not<1>(p_core_2e_act1)));
	// connection
	p_spi_2e_clk = p_clk;
	// cells $procmux$274 $flatten\core.$add$chip-v3/src/uds3_core.v:65$40
	i_procmux_24_274__Y = (p_rst__n ? add_uu<20>(p_core_2e_frame.curr.concat(p_core_2e_v.curr).concat(p_core_2e_t.curr).val(), value<20>{0x1u}) : value<20>{0u});
	// connection
	p_core_2e_clk = p_clk;
	// connection
	p_audio = p_core_2e_y;
	// cells $procdff$581 $procmux$537 $procmux$535 $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:87$268 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:87$267 $flatten\spi.$ternary$chip-v3/src/uds3_spi.v:88$272 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:88$269 $flatten\spi.$ternary$chip-v3/src/uds3_spi.v:88$271 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:88$270
	if (posedge_p_clk) {
		p_spi_2e_rx.next = (p_spi_2e_rise ? (logic_and<1>(p_spi_2e_cmd__end, eq_uu<1>(p_spi_2e_byte__in.slice<7,4>().val(), value<4>{0x3u})) ? (logic_not<1>(p_spi_2e_byte__in.slice<3,0>().val()) ? value<8>{0xd5u} : (eq_uu<1>(p_spi_2e_byte__in.slice<3,0>().val(), value<4>{0x1u}) ? value<8>{0x32u} : value<8>{0u})) : p_spi_2e_rx.curr.slice<6,0>().concat(p_spi_2e_mosi__s.curr).val()) : p_spi_2e_rx.curr);
	}
	// cells $procdff$580 $procmux$509 $procmux$506 $procmux$504
	if (posedge_p_clk) {
		p_spi_2e_is__hit.next = (p_rst__n ? (p_spi_2e_hit__cmd ? value<1>{0x1u} : (i_flatten_5c_spi_2e__24_logic__not_24_chip_2d_v3_2f_src_2f_uds3__spi_2e_v_3a_67_24_261__Y ? value<1>{0u} : p_spi_2e_is__hit.curr)) : value<1>{0u});
	}
	// cells $procdff$579 $procmux$519 $procmux$516 $procmux$513 $procmux$511 $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:73$264 $flatten\spi.$ne$chip-v3/src/uds3_spi.v:73$263 $flatten\spi.$add$chip-v3/src/uds3_spi.v:73$265
	if (posedge_p_clk) {
		p_spi_2e_bytecnt.next = (p_rst__n ? (i_flatten_5c_spi_2e__24_logic__not_24_chip_2d_v3_2f_src_2f_uds3__spi_2e_v_3a_67_24_261__Y ? value<3>{0u} : (p_spi_2e_rise ? (logic_and<1>(p_spi_2e_last__bit, ne_uu<1>(p_spi_2e_bytecnt.curr, value<3>{0x5u})) ? add_uu<3>(p_spi_2e_bytecnt.curr, value<3>{0x1u}) : p_spi_2e_bytecnt.curr) : p_spi_2e_bytecnt.curr)) : value<3>{0u});
	}
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:60.3-68.6
	// cell $procdff$548
	if (posedge_p_clk) {
		p_core_2e_t.next = i_procmux_24_274__Y.slice<5,0>().val();
	}
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:60.3-68.6
	// cell $procdff$549
	if (posedge_p_clk) {
		p_core_2e_v.next = i_procmux_24_274__Y.slice<6>().val();
	}
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:60.3-68.6
	// cell $procdff$550
	if (posedge_p_clk) {
		p_core_2e_frame.next = i_procmux_24_274__Y.slice<19,7>().val();
	}
	// cells $procdff$551 $procmux$279 $procmux$276
	if (posedge_p_clk) {
		p_core_2e_clearing.next = (p_rst__n ? (p_core_2e_fend ? value<1>{0u} : p_core_2e_clearing.curr) : value<1>{0x1u});
	}
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:74.3-74.54
	// cell $procdff$552
	if (posedge_p_clk) {
		p_core_2e_ring.next = p_core_2e_ring.curr.slice<126,0>().concat(i_procmux_24_454__Y).val();
	}
	// cells $procdff$553 $procmux$326 $flatten\core.$and$chip-v3/src/uds3_core.v:104$52 $flatten\core.$or$chip-v3/src/uds3_core.v:104$51 $flatten\core.$eq$chip-v3/src/uds3_core.v:104$50 $flatten\core.$ge$chip-v3/src/uds3_core.v:104$49 $flatten\core.$reduce_or$chip-v3/src/uds3_core.v:104$48
	if (posedge_p_clk) {
		p_core_2e_c__dec.next = (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_103_24_47__Y ? and_uu<1>(reduce_or<1>(p_core_2e_c__env.curr), or_uu<1>(ge_uu<1>(p_core_2e_tz, p_core_2e_w0.slice<8>().concat(p_core_2e_w0.slice<9>()).concat(p_core_2e_w0.slice<10>()).concat(p_core_2e_w0.slice<11>()).val()), eq_uu<1>(p_core_2e_tz, value<4>{0xdu}))) : p_core_2e_c__dec.curr);
	}
	// cells $procdff$554 $procmux$324 $flatten\core.$and$chip-v3/src/uds3_core.v:105$55 $flatten\core.$ge$chip-v3/src/uds3_core.v:105$54 $flatten\core.$ternary$chip-v3/src/uds3_core.v:92$44 $flatten\core.$add$chip-v3/src/uds3_core.v:92$43 $flatten\core.$reduce_or$chip-v3/src/uds3_core.v:105$53
	if (posedge_p_clk) {
		p_core_2e_c__adec.next = (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_103_24_47__Y ? and_uu<1>(reduce_or<1>(p_core_2e_z__aux), ge_uu<1>(p_core_2e_tz, (i_flatten_5c_core_2e__24_and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_90_24_42__Y ? value<1>{0u}.concat(p_core_2e_z__bt).val() : add_uu<4>(value<1>{0u}.concat(p_core_2e_z__bt).val(), value<4>{0x3u})))) : p_core_2e_c__adec.curr);
	}
	// cells $procdff$555 $procmux$322 $flatten\core.$eq$chip-v3/src/uds3_core.v:106$56
	if (posedge_p_clk) {
		p_core_2e_c__alt8.next = (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_103_24_47__Y ? logic_not<1>(p_core_2e_z__aux.slice<7,3>().val()) : p_core_2e_c__alt8.curr);
	}
	// cells $procdff$556 $procmux$320
	if (posedge_p_clk) {
		p_core_2e_c__lin.next = (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_103_24_47__Y ? i_flatten_5c_core_2e__24_and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_90_24_42__Y : p_core_2e_c__lin.curr);
	}
	// cells $procdff$557 $procmux$338
	if (posedge_p_clk) {
		p_core_2e_c__env.next = (p_core_2e_wend ? p_core_2e_ring.curr.slice<87>().concat(p_core_2e_ring.curr.slice<88>()).concat(p_core_2e_ring.curr.slice<89>()).concat(p_core_2e_ring.curr.slice<90>()).concat(p_core_2e_ring.curr.slice<91>()).concat(p_core_2e_ring.curr.slice<92>()).concat(p_core_2e_ring.curr.slice<93>()).concat(p_core_2e_ring.curr.slice<94>()).val() : p_core_2e_c__env.curr);
	}
	// cells $procdff$558 $procmux$336 $flatten\core.$eq$chip-v3/src/uds3_core.v:160$91 $flatten\core.$ternary$chip-v3/src/uds3_core.v:130$61 $procmux$334 $flatten\core.$ternary$chip-v3/src/uds3_core.v:137$74 $flatten\core.$eq$chip-v3/src/uds3_core.v:137$70 $flatten\core.$ternary$chip-v3/src/uds3_core.v:138$73 $flatten\core.$eq$chip-v3/src/uds3_core.v:138$71 $flatten\core.$ternary$chip-v3/src/uds3_core.v:135$66 $flatten\core.$xor$chip-v3/src/uds3_core.v:135$64 $flatten\core.$ternary$chip-v3/src/uds3_core.v:139$72 $flatten\core.$ternary$chip-v3/src/uds3_core.v:136$69 $flatten\core.$xor$chip-v3/src/uds3_core.v:136$68 $flatten\core.$xor$chip-v3/src/uds3_core.v:136$67
	if (posedge_p_clk) {
		p_core_2e_c__tone.next = (eq_uu<1>(p_core_2e_t.curr, value<6>{0x2fu}) ? (p_core_2e_pe__raw.slice<8>().val() ? value<8>{0xffu} : p_core_2e_pe__raw.slice<7,0>().val()) : (p_core_2e_wend ? (logic_not<1>(p_core_2e_n__wave) ? p_core_2e_trw : (eq_uu<1>(p_core_2e_n__wave, value<2>{0x1u}) ? (xor_uu<1>(p_core_2e_trw.slice<7>().val(), p_core_2e_trw.slice<6>().val()) ? p_core_2e_trw.slice<7>().concat(i_flatten_5c_core_2e__24_not_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_135_24_65__Y.repeat<7>()).val() : p_core_2e_trw.slice<6,0>().concat(value<1>{0u}).val()) : ((p_core_2e_n__wave.slice<0>().val() ? xor_uu<1>(xor_uu<1>(p_core_2e_n__ph.slice<9>().val(), p_core_2e_frame.curr.slice<0>().val()), p_core_2e_frame.curr.slice<2>().val()) : p_core_2e_n__ph.slice<9>().val()) ? value<8>{0x80u} : value<8>{0x7fu}))) : p_core_2e_c__tone.curr));
	}
	// cells $procdff$559 $procmux$332 $flatten\core.$eq$chip-v3/src/uds3_core.v:157$90
	if (posedge_p_clk) {
		p_core_2e_c__clap.next = (p_core_2e_wend ? eq_uu<1>(p_core_2e_n__mode, value<2>{0x3u}) : p_core_2e_c__clap.curr);
	}
	// cells $procdff$560 $procmux$330 $flatten\core.$ternary$chip-v3/src/uds3_core.v:143$88 $flatten\core.$eq$chip-v3/src/uds3_core.v:143$75 $flatten\core.$ternary$chip-v3/src/uds3_core.v:143$79 $flatten\core.$gt$chip-v3/src/uds3_core.v:143$77 $flatten\core.$not$chip-v3/src/uds3_core.v:143$76 $flatten\core.$not$chip-v3/src/uds3_core.v:143$78 $flatten\core.$ternary$chip-v3/src/uds3_core.v:144$87 $flatten\core.$eq$chip-v3/src/uds3_core.v:144$80 $flatten\core.$ternary$chip-v3/src/uds3_core.v:144$82 $flatten\core.$lt$chip-v3/src/uds3_core.v:144$81 $flatten\core.$ternary$chip-v3/src/uds3_core.v:145$86 $flatten\core.$eq$chip-v3/src/uds3_core.v:145$83 $flatten\core.$ternary$chip-v3/src/uds3_core.v:145$85 $flatten\core.$ne$chip-v3/src/uds3_core.v:145$84
	if (posedge_p_clk) {
		p_core_2e_c__mix.next = (p_core_2e_wend ? (eq_uu<1>(p_core_2e_n__mode, value<2>{0x1u}) ? (gt_uu<1>(p_core_2e_n__mix, not_u<3>(p_core_2e_a3)) ? p_core_2e_n__mix : not_u<3>(p_core_2e_a3)) : (eq_uu<1>(p_core_2e_n__mode, value<2>{0x2u}) ? (lt_uu<1>(p_core_2e_n__mix, p_core_2e_a3) ? p_core_2e_n__mix : p_core_2e_a3) : (eq_uu<1>(p_core_2e_n__mode, value<2>{0x3u}) ? (reduce_bool<1>(p_core_2e_n__aux.slice<7,6>().val()) ? p_core_2e_n__aux.slice<5,3>().val() : p_core_2e_n__mix) : p_core_2e_n__mix))) : p_core_2e_c__mix.curr);
	}
	// cells $procdff$561 $procmux$328
	if (posedge_p_clk) {
		p_core_2e_c__color.next = (p_core_2e_wend ? p_core_2e_ring.curr.slice<112,111>().val() : p_core_2e_c__color.curr);
	}
	// cells $procdff$562 $flatten\core.$or$chip-v3/src/uds3_core.v:183$119 $flatten\core.$and$chip-v3/src/uds3_core.v:183$118 $flatten\core.$and$chip-v3/src/uds3_core.v:183$117 $flatten\core.$or$chip-v3/src/uds3_core.v:183$116 $flatten\core.$not$chip-v3/src/uds3_core.v:183$115
	if (posedge_p_clk) {
		p_core_2e_bor.next = or_uu<1>(and_uu<1>(not_u<1>(p_core_2e_head), or_uu<1>(p_core_2e_d__bit, p_core_2e_bor__in)), and_uu<1>(p_core_2e_d__bit, p_core_2e_bor__in));
	}
	// cells $procdff$563 $flatten\core.$or$chip-v3/src/uds3_core.v:184$124 $flatten\core.$and$chip-v3/src/uds3_core.v:184$123 $flatten\core.$or$chip-v3/src/uds3_core.v:184$122 $flatten\core.$and$chip-v3/src/uds3_core.v:184$121 $flatten\core.$and$chip-v3/src/uds3_core.v:184$120
	if (posedge_p_clk) {
		p_core_2e_cy.next = or_uu<1>(or_uu<1>(and_uu<1>(p_core_2e_head, p_core_2e_inc__bit), and_uu<1>(p_core_2e_head, p_core_2e_cy__in)), and_uu<1>(p_core_2e_inc__bit, p_core_2e_cy__in));
	}
	// cells $procdff$564 $procmux$389 $procmux$386 $procmux$383
	if (posedge_p_clk) {
		p_core_2e_pend.next = (p_rst__n ? (p_core_2e_hit__cmd ? value<1>{0x1u} : (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_204_24_129__Y ? value<1>{0u} : p_core_2e_pend.curr)) : value<1>{0u});
	}
	// cells $procdff$565 $procmux$381 $procmux$378 $procmux$375 $procmux$484 $procmux$481 $procmux$478 $procmux$475 $procmux$472 $procmux$469 $procmux$466 $procmux$463 $procmux$460 $procmux$457 $flatten\core.$lt$chip-v3/src/uds3_core.v:277$192
	if (posedge_p_clk) {
		p_core_2e_tgt.next = (p_rst__n ? (p_core_2e_hit__cmd ? p_core_2e_tgt.curr : (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_204_24_129__Y ? (p_core_2e_same0 ? value<1>{0u} : (p_core_2e_same0 ? value<1>{0u} : (p_core_2e_same1 ? value<1>{0x1u} : (p_core_2e_same0 ? value<1>{0u} : (p_core_2e_same1 ? value<1>{0u} : (i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_179__Y ? (p_core_2e_same0 ? value<1>{0u} : (p_core_2e_same1 ? value<1>{0u} : (i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_179__Y ? (i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_180__Y ? lt_uu<1>(p_core_2e_e1.slice<7,5>().val(), p_core_2e_e0.slice<7,5>().val()) : value<1>{0x1u}) : value<1>{0u}))) : value<1>{0u})))))) : p_core_2e_tgt.curr)) : value<1>{0u});
	}
	// cells $procdff$566 $procmux$373 $procmux$370 $procmux$368 $procmux$365
	if (posedge_p_clk) {
		p_core_2e_hv.next = (p_rst__n ? (p_core_2e_wend ? (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_207_24_133__Y ? i_procmux_24_363__Y : (p_core_2e_con.curr ? value<1>{0u} : i_procmux_24_363__Y)) : i_procmux_24_363__Y) : value<1>{0u});
	}
	// cells $procdff$567 $procmux$361 $procmux$358 $procmux$356 $procmux$353
	if (posedge_p_clk) {
		p_core_2e_con.next = (p_rst__n ? (p_core_2e_wend ? (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_207_24_133__Y ? value<1>{0x1u} : (p_core_2e_con.curr ? value<1>{0u} : p_core_2e_con.curr)) : p_core_2e_con.curr) : value<1>{0u});
	}
	// cells $procdff$568 $procmux$351 $procmux$348
	if (posedge_p_clk) {
		p_core_2e_kill.next = (p_rst__n ? (p_core_2e_fend ? p_core_2e_kill__pend.curr : p_core_2e_kill.curr) : value<1>{0u});
	}
	// cells $procdff$569 $procmux$341 $flatten\core.$or$chip-v3/src/uds3_core.v:213$136 $flatten\core.$and$chip-v3/src/uds3_core.v:213$135 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:213$134 $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:51$252 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:51$251
	if (posedge_p_clk) {
		p_core_2e_kill__pend.next = (p_rst__n ? or_uu<1>(logic_and<1>(p_spi_2e_cmd__end, eq_uu<1>(p_spi_2e_byte__in, value<8>{0x40u})), and_uu<1>(p_core_2e_kill__pend.curr, logic_not<1>(p_core_2e_fend))) : value<1>{0u});
	}
	// cells $procdff$570 $procmux$346 $procmux$343
	if (posedge_p_clk) {
		p_core_2e_cb.next = (p_rst__n ? (p_core_2e_byte__done ? p_spi_2e_bytecnt.curr : p_core_2e_cb.curr) : p_core_2e_cb.curr);
	}
	// cells $procdff$571 $procmux$489 $procmux$486 $flatten\core.$xor$chip-v3/src/uds3_core.v:286$195
	if (posedge_p_clk) {
		p_core_2e_lfsr.next = (p_rst__n ? (p_core_2e_fend ? p_core_2e_lfsr.curr.slice<15,0>().concat(xor_uu<1>(p_core_2e_lfsr.curr.slice<16>().val(), p_core_2e_lfsr.curr.slice<13>().val())).val() : p_core_2e_lfsr.curr) : value<17>{0x1u});
	}
	// cells $procdff$572 $procmux$495 $flatten\core.$add$chip-v3/src/uds3_core.v:322$229 $flatten\core.$not$chip-v3/src/uds3_core.v:321$228
	if (posedge_p_clk) {
		p_core_2e_sd__v1.next = (p_core_2e_sd__restart ? value<11>{0u} : add_uu<12>(p_core_2e_sd__v1.curr.slice<10>().concat(p_core_2e_sd__v1.curr).val(), p_core_2e_y.repeat<3>().concat(not_u<1>(p_core_2e_x.slice<7>().val())).concat(p_core_2e_x).val()).slice<10,0>().val());
	}
	// cells $procdff$573 $procmux$492 $flatten\core.$add$chip-v3/src/uds3_core.v:324$233 $flatten\core.$add$chip-v3/src/uds3_core.v:324$232 $flatten\core.$add$chip-v3/src/uds3_core.v:324$231
	if (posedge_p_clk) {
		p_core_2e_sd__v2.next = (p_core_2e_sd__restart ? value<12>{0xfffu} : add_uu<3>(add_uu<3>(add_uu<3>(p_core_2e_sd__v2.curr.slice<11,9>().val(), p_core_2e_sd__v1.curr.slice<10>().concat(p_core_2e_sd__v1.curr.slice<10,9>()).val()), p_core_2e_y.repeat<2>().concat(value<1>{0x1u}).val()), value<2>{0u}.concat(i_flatten_5c_core_2e__24_add_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_323_24_230__Y.slice<9>()).val()).concat(i_flatten_5c_core_2e__24_add_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_323_24_230__Y.slice<8,0>()).val());
	}
	// cells $procdff$574 $procmux$532 $procmux$529
	if (posedge_p_clk) {
		p_spi_2e_ch.next = (p_rst__n ? (p_spi_2e_hit__cmd ? p_spi_2e_rx.curr.slice<1,0>().concat(p_spi_2e_mosi__s.curr).val() : p_spi_2e_ch.curr) : value<3>{0u});
	}
	// cells $procdff$575 $procmux$501
	if (posedge_p_clk) {
		p_spi_2e_cs__s.next = (p_rst__n ? p_spi_2e_cs__s.curr.slice<0>().concat(p_uio__in.slice<0>()).val() : value<2>{0x3u});
	}
	// cells $procdff$576 $procmux$498
	if (posedge_p_clk) {
		p_spi_2e_sck__s.next = (p_rst__n ? p_spi_2e_sck__s.curr.slice<1,0>().concat(p_uio__in.slice<3>()).val() : value<3>{0u});
	}
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:55.3-80.6
	// cell $procdff$577
	if (posedge_p_clk) {
		p_spi_2e_mosi__s.next = p_uio__in.slice<1>().val();
	}
	// cells $procdff$578 $procmux$527 $procmux$524 $procmux$521 $flatten\spi.$add$chip-v3/src/uds3_spi.v:72$262
	if (posedge_p_clk) {
		p_spi_2e_bitcnt.next = (p_rst__n ? (i_flatten_5c_spi_2e__24_logic__not_24_chip_2d_v3_2f_src_2f_uds3__spi_2e_v_3a_67_24_261__Y ? value<3>{0u} : (p_spi_2e_rise ? add_uu<3>(p_spi_2e_bitcnt.curr, value<3>{0x1u}) : p_spi_2e_bitcnt.curr)) : value<3>{0u});
	}
	// connection
	p_uio__oe = value<8>{0xf4u};
	// cells $flatten\spi.$and$chip-v3/src/uds3_spi.v:53$258 $flatten\core.$not$chip-v3/src/uds3_core.v:196$126 $flatten\core.$or$chip-v3/src/uds3_core.v:195$125
	p_uio__out = p_audio.repeat<2>().concat(or_uu<1>(p_core_2e_pend.curr, p_core_2e_hv.curr)).concat(not_u<1>(p_core_2e_v.curr)).concat(value<1>{0u}).concat(and_uu<1>(p_spi_2e_active, p_spi_2e_rx.curr.slice<7>().val())).concat(value<2>{0u}).val();
	// cells $procmux$540 $procmux$541_CMP0 $procmux$542_CMP0 $procmux$543_CMP0 $procmux$544_CMP0 $procmux$545_CMP0 $procmux$546_CMP0 $procmux$547_CMP0
	p_uo__out = p_audio.concat((eq_uu<1>(p_hit__ch, value<3>{0x6u}) ? value<7>{0x7du} : (eq_uu<1>(p_hit__ch, value<3>{0x5u}) ? value<7>{0x6du} : (eq_uu<1>(p_hit__ch, value<3>{0x4u}) ? value<7>{0x66u} : (eq_uu<1>(p_hit__ch, value<3>{0x3u}) ? value<7>{0x4fu} : (eq_uu<1>(p_hit__ch, value<3>{0x2u}) ? value<7>{0x5bu} : (eq_uu<1>(p_hit__ch, value<3>{0x1u}) ? value<7>{0x6u} : (logic_not<1>(p_hit__ch) ? value<7>{0x3fu} : value<7>{0x7u})))))))).val();
	return converged;
}

bool p_tt__um__ai__wrangler__uds3::commit() {
	bool changed = false;
	if (p_core_2e_t.commit()) changed = true;
	if (p_core_2e_v.commit()) changed = true;
	if (p_core_2e_frame.commit()) changed = true;
	if (p_core_2e_clearing.commit()) changed = true;
	if (p_core_2e_ring.commit()) changed = true;
	if (p_core_2e_c__env.commit()) changed = true;
	if (p_core_2e_c__dec.commit()) changed = true;
	if (p_core_2e_c__adec.commit()) changed = true;
	if (p_core_2e_c__alt8.commit()) changed = true;
	if (p_core_2e_c__lin.commit()) changed = true;
	if (p_core_2e_c__tone.commit()) changed = true;
	if (p_core_2e_c__clap.commit()) changed = true;
	if (p_core_2e_c__mix.commit()) changed = true;
	if (p_core_2e_c__color.commit()) changed = true;
	if (p_core_2e_bor.commit()) changed = true;
	if (p_core_2e_cy.commit()) changed = true;
	if (p_core_2e_pend.commit()) changed = true;
	if (p_core_2e_tgt.commit()) changed = true;
	if (p_core_2e_hv.commit()) changed = true;
	if (p_core_2e_con.commit()) changed = true;
	if (p_core_2e_kill.commit()) changed = true;
	if (p_core_2e_kill__pend.commit()) changed = true;
	if (p_core_2e_cb.commit()) changed = true;
	if (p_core_2e_lfsr.commit()) changed = true;
	if (p_core_2e_sd__v1.commit()) changed = true;
	if (p_core_2e_sd__v2.commit()) changed = true;
	if (p_spi_2e_ch.commit()) changed = true;
	if (p_spi_2e_rx.commit()) changed = true;
	if (p_spi_2e_cs__s.commit()) changed = true;
	if (p_spi_2e_sck__s.commit()) changed = true;
	if (p_spi_2e_mosi__s.commit()) changed = true;
	if (p_spi_2e_bitcnt.commit()) changed = true;
	if (p_spi_2e_bytecnt.commit()) changed = true;
	if (p_spi_2e_is__hit.commit()) changed = true;
	prev_p_clk = p_clk;
	return changed;
}

void p_tt__um__ai__wrangler__uds3::debug_eval() {
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:133.22-133.46
	value<8> i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_133_24_62__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:135.54-135.61
	value<1> i_flatten_5c_core_2e__24_not_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_135_24_65__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:180.24-180.46
	value<1> i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_180_24_113__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:245.14-245.24
	value<1> i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:246.14-246.23
	value<1> i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_246_24_170__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:247.14-247.23
	value<1> i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_247_24_174__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.21-269.24
	value<1> i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_179__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.33-269.36
	value<1> i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_180__Y;
	// connection
	p_core_2e_pj = p_core_2e_t.curr.slice<3,0>().val();
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:176.24-176.57
	// cell $flatten\core.$sub$chip-v3/src/uds3_core.v:176$104
	p_core_2e_pk = sub_uu<5>(value<1>{0u}.concat(p_core_2e_pj).val(), value<2>{0u}.concat(p_core_2e_c__tone.curr.slice<7,5>()).val());
	// connection
	p_core_2e_mant = value<1>{0x1u}.concat(p_core_2e_c__tone.curr.slice<4,0>()).val();
	// connection
	p_core_2e_r = p_core_2e_t.curr.slice<5,3>().val();
	// connection
	p_core_2e_j = p_core_2e_t.curr.slice<2,0>().val();
	// connection
	p_core_2e_is__aux = p_core_2e_r.slice<0>().val();
	// cells $flatten\core.$logic_and$chip-v3/src/uds3_core.v:178$109 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$108 $flatten\core.$logic_and$chip-v3/src/uds3_core.v:178$107 $flatten\core.$le$chip-v3/src/uds3_core.v:178$106 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:178$105
	p_core_2e_inc__bit = logic_and<1>(logic_and<1>(logic_not<1>(p_core_2e_pk.slice<4>().val()), le_uu<1>(p_core_2e_pk.slice<3,0>().val(), value<4>{0x5u})), shiftx_uu<1>(p_core_2e_mant, p_core_2e_pk.slice<2,0>().val()));
	// connection
	p_core_2e_head = p_core_2e_ring.curr.slice<127>().val();
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:179$111 $flatten\core.$eq$chip-v3/src/uds3_core.v:179$110
	p_core_2e_cy__in = (logic_not<1>(p_core_2e_pj) ? value<1>{0u} : p_core_2e_cy.curr);
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:168$95 $flatten\core.$or$chip-v3/src/uds3_core.v:168$92 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:168$94 $flatten\core.$reduce_or$chip-v3/src/uds3_core.v:168$93
	p_core_2e_sml = (p_core_2e_is__aux ? or_uu<1>(p_core_2e_c__alt8.curr, p_core_2e_c__lin.curr) : logic_not<1>(reduce_or<1>(p_core_2e_c__env.curr.slice<7,3>().val())));
	// cells $flatten\core.$xor$chip-v3/src/uds3_core.v:180$113 $flatten\core.$xor$chip-v3/src/uds3_core.v:180$112
	i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_180_24_113__Y = xor_uu<1>(xor_uu<1>(p_core_2e_head, p_core_2e_inc__bit), p_core_2e_cy__in);
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:247.14-247.23
	// cell $flatten\core.$eq$chip-v3/src/uds3_core.v:247$174
	i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_247_24_174__Y = eq_uu<1>(p_core_2e_r, value<3>{0x5u});
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:246.14-246.23
	// cell $flatten\core.$eq$chip-v3/src/uds3_core.v:246$170
	i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_246_24_170__Y = eq_uu<1>(p_core_2e_r, value<3>{0x4u});
	// cells $procmux$406 $procmux$407_CMP0 $procmux$408_CMP0 $procmux$409_CMP0 $procmux$410_CMP0 $flatten\core.$ge$chip-v3/src/uds3_core.v:228$150 $flatten\core.$eq$chip-v3/src/uds3_core.v:226$147 $flatten\core.$eq$chip-v3/src/uds3_core.v:225$144 $flatten\core.$or$chip-v3/src/uds3_core.v:224$140 $flatten\core.$eq$chip-v3/src/uds3_core.v:224$139 $flatten\core.$eq$chip-v3/src/uds3_core.v:224$138
	p_core_2e_cwr = (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x4u}) ? ge_uu<1>(p_core_2e_r, value<3>{0x3u}) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x3u}) ? eq_uu<1>(p_core_2e_r, value<3>{0x2u}) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x2u}) ? eq_uu<1>(p_core_2e_r, value<3>{0x1u}) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x1u}) ? or_uu<1>(logic_not<1>(p_core_2e_r), eq_uu<1>(p_core_2e_r, value<3>{0x4u})) : value<1>{0u}))));
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:169$99 $flatten\core.$ternary$chip-v3/src/uds3_core.v:168$95 $flatten\core.$or$chip-v3/src/uds3_core.v:168$92 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:168$94 $flatten\core.$reduce_or$chip-v3/src/uds3_core.v:168$93 $flatten\core.$eq$chip-v3/src/uds3_core.v:169$96 $flatten\core.$and$chip-v3/src/uds3_core.v:169$98 $flatten\core.$le$chip-v3/src/uds3_core.v:169$97
	p_core_2e_d__bit = (p_core_2e_sml ? logic_not<1>(p_core_2e_j) : and_uu<1>(p_core_2e_ring.curr.slice<124>().val(), le_uu<1>(p_core_2e_j, value<3>{0x4u})));
	// cells $flatten\core.$logic_and$chip-v3/src/uds3_core.v:245$169 $procmux$406 $procmux$407_CMP0 $procmux$408_CMP0 $procmux$409_CMP0 $procmux$410_CMP0 $flatten\core.$ge$chip-v3/src/uds3_core.v:228$150 $flatten\core.$eq$chip-v3/src/uds3_core.v:226$147 $flatten\core.$eq$chip-v3/src/uds3_core.v:225$144 $flatten\core.$or$chip-v3/src/uds3_core.v:224$140 $flatten\core.$eq$chip-v3/src/uds3_core.v:224$139 $flatten\core.$eq$chip-v3/src/uds3_core.v:224$138
	i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y = logic_and<1>(p_core_2e_con.curr, p_core_2e_cwr);
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:170$101 $flatten\core.$eq$chip-v3/src/uds3_core.v:170$100
	p_core_2e_bor__in = (logic_not<1>(p_core_2e_j) ? value<1>{0u} : p_core_2e_bor.curr);
	// cells $flatten\core.$xor$chip-v3/src/uds3_core.v:171$103 $flatten\core.$xor$chip-v3/src/uds3_core.v:171$102
	p_core_2e_sub__out = xor_uu<1>(xor_uu<1>(p_core_2e_head, p_core_2e_d__bit), p_core_2e_bor__in);
	// connection
	p_core_2e_h1.slice<2>() = p_core_2e_ring.curr.slice<33>().val();
	// connection
	p_core_2e_h1.slice<1>() = p_core_2e_ring.curr.slice<34>().val();
	// connection
	p_core_2e_h1.slice<0>() = p_core_2e_ring.curr.slice<35>().val();
	// connection
	p_core_2e_e1.slice<7>() = p_core_2e_ring.curr.slice<23>().val();
	// connection
	p_core_2e_e1.slice<6>() = p_core_2e_ring.curr.slice<24>().val();
	// connection
	p_core_2e_e1.slice<5>() = p_core_2e_ring.curr.slice<25>().val();
	// connection
	p_core_2e_e1.slice<4>() = p_core_2e_ring.curr.slice<26>().val();
	// connection
	p_core_2e_e1.slice<3>() = p_core_2e_ring.curr.slice<27>().val();
	// connection
	p_core_2e_e1.slice<2>() = p_core_2e_ring.curr.slice<28>().val();
	// connection
	p_core_2e_e1.slice<1>() = p_core_2e_ring.curr.slice<29>().val();
	// connection
	p_core_2e_e1.slice<0>() = p_core_2e_ring.curr.slice<30>().val();
	// connection
	p_core_2e_h0.slice<2>() = p_core_2e_ring.curr.slice<97>().val();
	// connection
	p_core_2e_h0.slice<1>() = p_core_2e_ring.curr.slice<98>().val();
	// connection
	p_core_2e_h0.slice<0>() = p_core_2e_ring.curr.slice<99>().val();
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:268$178 $flatten\core.$eq$chip-v3/src/uds3_core.v:268$177
	p_core_2e_hg = (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x7u}) ? value<3>{0x6u} : p_spi_2e_ch.curr);
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.33-269.36
	// cell $flatten\core.$reduce_or$chip-v3/src/uds3_core.v:269$180
	i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_180__Y = reduce_or<1>(p_core_2e_e1);
	// connection
	p_core_2e_e0.slice<7>() = p_core_2e_ring.curr.slice<87>().val();
	// connection
	p_core_2e_e0.slice<6>() = p_core_2e_ring.curr.slice<88>().val();
	// connection
	p_core_2e_e0.slice<5>() = p_core_2e_ring.curr.slice<89>().val();
	// connection
	p_core_2e_e0.slice<4>() = p_core_2e_ring.curr.slice<90>().val();
	// connection
	p_core_2e_e0.slice<3>() = p_core_2e_ring.curr.slice<91>().val();
	// connection
	p_core_2e_e0.slice<2>() = p_core_2e_ring.curr.slice<92>().val();
	// connection
	p_core_2e_e0.slice<1>() = p_core_2e_ring.curr.slice<93>().val();
	// connection
	p_core_2e_e0.slice<0>() = p_core_2e_ring.curr.slice<94>().val();
	// connection
	p_core_2e_act1 = i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_180__Y;
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:269.21-269.24
	// cell $flatten\core.$reduce_or$chip-v3/src/uds3_core.v:269$179
	i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_179__Y = reduce_or<1>(p_core_2e_e0);
	// connection
	p_core_2e_act0 = i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_179__Y;
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:44.25-44.33
	// cell $flatten\spi.$logic_not$chip-v3/src/uds3_spi.v:44$241
	p_spi_2e_active = logic_not<1>(p_spi_2e_cs__s.curr.slice<1>().val());
	// cells $flatten\core.$logic_and$chip-v3/src/uds3_core.v:271$188 $flatten\core.$eq$chip-v3/src/uds3_core.v:271$187 $flatten\core.$ternary$chip-v3/src/uds3_core.v:271$186 $flatten\core.$eq$chip-v3/src/uds3_core.v:271$185
	p_core_2e_same1 = logic_and<1>(p_core_2e_act1, eq_uu<1>((eq_uu<1>(p_core_2e_h1, value<3>{0x7u}) ? value<3>{0x6u} : p_core_2e_h1), p_core_2e_hg));
	// cells $flatten\core.$logic_and$chip-v3/src/uds3_core.v:270$184 $flatten\core.$eq$chip-v3/src/uds3_core.v:270$183 $flatten\core.$ternary$chip-v3/src/uds3_core.v:270$182 $flatten\core.$eq$chip-v3/src/uds3_core.v:270$181
	p_core_2e_same0 = logic_and<1>(p_core_2e_act0, eq_uu<1>((eq_uu<1>(p_core_2e_h0, value<3>{0x7u}) ? value<3>{0x6u} : p_core_2e_h0), p_core_2e_hg));
	// cells $flatten\core.$add$chip-v3/src/uds3_core.v:290$198 $flatten\core.$add$chip-v3/src/uds3_core.v:290$197 $flatten\core.$add$chip-v3/src/uds3_core.v:290$196
	p_core_2e_pc4 = add_uu<3>(add_uu<3>(add_uu<3>(value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<0>()).val(), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<1>()).val()), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<2>()).val()), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<3>()).val());
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:45$244 $flatten\spi.$logic_not$chip-v3/src/uds3_spi.v:45$243 $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:45$242
	p_spi_2e_rise = logic_and<1>(logic_and<1>(p_spi_2e_active, p_spi_2e_sck__s.curr.slice<1>().val()), logic_not<1>(p_spi_2e_sck__s.curr.slice<2>().val()));
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:294$207 $flatten\core.$xor$chip-v3/src/uds3_core.v:294$206 $flatten\core.$xor$chip-v3/src/uds3_core.v:294$205
	p_core_2e_metal = (xor_uu<1>(xor_uu<1>(p_core_2e_frame.curr.slice<1>().val(), p_core_2e_frame.curr.slice<3>().val()), p_core_2e_frame.curr.slice<4>().val()) ? value<8>{0x7fu} : value<8>{0x80u});
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:293$204 $flatten\core.$eq$chip-v3/src/uds3_core.v:293$202 $flatten\core.$ternary$chip-v3/src/uds3_core.v:293$203
	p_core_2e_brite = (eq_uu<1>(p_core_2e_lfsr.curr.slice<0>().val(), p_core_2e_lfsr.curr.slice<1>().val()) ? value<8>{0u} : (p_core_2e_lfsr.curr.slice<0>().val() ? value<8>{0x7fu} : value<8>{0x80u}));
	// cells $procmux$400 $procmux$401_CMP0 $procmux$402_CMP0 $procmux$403_CMP0 $procmux$404_CMP0 $procmux$397 $procmux$398_CMP0 $procmux$393 $procmux$394_CMP0 $procmux$395_CMP0 $procmux$396_CMP0 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$162 $flatten\core.$add$chip-v3/src/uds3_core.v:233$161 $flatten\core.$ternary$chip-v3/src/uds3_core.v:230$160 $flatten\core.$lt$chip-v3/src/uds3_core.v:230$151 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$153 $flatten\core.$not$chip-v3/src/uds3_core.v:230$152 $flatten\core.$ternary$chip-v3/src/uds3_core.v:231$159 $flatten\core.$eq$chip-v3/src/uds3_core.v:231$154 $flatten\core.$ternary$chip-v3/src/uds3_core.v:231$158 $flatten\core.$eq$chip-v3/src/uds3_core.v:231$155 $flatten\core.$ternary$chip-v3/src/uds3_core.v:232$157 $flatten\core.$eq$chip-v3/src/uds3_core.v:232$156 $flatten\core.$ternary$chip-v3/src/uds3_core.v:235$167 $flatten\core.$eq$chip-v3/src/uds3_core.v:235$163 $flatten\core.$not$chip-v3/src/uds3_core.v:235$164 $flatten\core.$ternary$chip-v3/src/uds3_core.v:236$166 $flatten\core.$eq$chip-v3/src/uds3_core.v:236$165 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$149 $flatten\core.$not$chip-v3/src/uds3_core.v:226$148 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$146 $flatten\core.$not$chip-v3/src/uds3_core.v:225$145 $flatten\core.$ternary$chip-v3/src/uds3_core.v:224$143 $flatten\core.$shiftx$chip-v3/src/uds3_core.v:0$142 $flatten\core.$not$chip-v3/src/uds3_core.v:224$141
	p_core_2e_cbit = (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x4u}) ? (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x4u}) ? (eq_uu<1>(p_core_2e_r, value<3>{0x5u}) ? value<1>{0x1u} : (eq_uu<1>(p_core_2e_r, value<3>{0x4u}) ? shiftx_uu<1>(p_spi_2e_rx.curr, add_uu<3>(value<1>{0u}.concat(p_core_2e_j.slice<1,0>()).val(), value<3>{0x1u})) : (eq_uu<1>(p_core_2e_r, value<3>{0x3u}) ? (lt_uu<1>(p_core_2e_j, value<3>{0x3u}) ? shiftx_uu<1>(p_spi_2e_rx.curr, not_u<3>(p_core_2e_j)) : (eq_uu<1>(p_core_2e_j, value<3>{0x3u}) ? p_spi_2e_ch.curr.slice<0>().val() : (eq_uu<1>(p_core_2e_j, value<3>{0x4u}) ? p_spi_2e_ch.curr.slice<1>().val() : (eq_uu<1>(p_core_2e_j, value<3>{0x5u}) ? p_spi_2e_ch.curr.slice<2>().val() : value<1>{0u})))) : (eq_uu<1>(p_core_2e_t.curr.slice<3,0>().val(), value<4>{0xeu}) ? not_u<1>(p_spi_2e_rx.curr.slice<0>().val()) : (eq_uu<1>(p_core_2e_t.curr.slice<3,0>().val(), value<4>{0xfu}) ? p_spi_2e_rx.curr.slice<0>().val() : value<1>{0u}))))) : value<1>{0u}) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x3u}) ? shiftx_uu<1>(p_spi_2e_rx.curr, not_u<3>(p_core_2e_j)) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x2u}) ? shiftx_uu<1>(p_spi_2e_rx.curr, not_u<3>(p_core_2e_j)) : (eq_uu<1>(p_core_2e_cb.curr, value<3>{0x1u}) ? (p_core_2e_r.slice<2>().val() ? value<1>{0u} : shiftx_uu<1>(p_spi_2e_rx.curr, not_u<3>(p_core_2e_j))) : value<1>{0u}))));
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:292.22-292.45
	// cell $flatten\core.$ternary$chip-v3/src/uds3_core.v:292$201
	p_core_2e_white = (p_core_2e_lfsr.curr.slice<0>().val() ? value<8>{0x7fu} : value<8>{0x80u});
	// connection
	p_core_2e_nw.slice<63>() = p_core_2e_ring.curr.slice<63>().val();
	// connection
	p_core_2e_nw.slice<62>() = p_core_2e_ring.curr.slice<64>().val();
	// connection
	p_core_2e_nw.slice<61>() = p_core_2e_ring.curr.slice<65>().val();
	// connection
	p_core_2e_nw.slice<60>() = p_core_2e_ring.curr.slice<66>().val();
	// connection
	p_core_2e_nw.slice<59>() = p_core_2e_ring.curr.slice<67>().val();
	// connection
	p_core_2e_nw.slice<58>() = p_core_2e_ring.curr.slice<68>().val();
	// connection
	p_core_2e_nw.slice<57>() = p_core_2e_ring.curr.slice<69>().val();
	// connection
	p_core_2e_nw.slice<56>() = p_core_2e_ring.curr.slice<70>().val();
	// connection
	p_core_2e_nw.slice<55>() = p_core_2e_ring.curr.slice<71>().val();
	// connection
	p_core_2e_nw.slice<54>() = p_core_2e_ring.curr.slice<72>().val();
	// connection
	p_core_2e_nw.slice<53>() = p_core_2e_ring.curr.slice<73>().val();
	// connection
	p_core_2e_nw.slice<52>() = p_core_2e_ring.curr.slice<74>().val();
	// connection
	p_core_2e_nw.slice<51>() = p_core_2e_ring.curr.slice<75>().val();
	// connection
	p_core_2e_nw.slice<50>() = p_core_2e_ring.curr.slice<76>().val();
	// connection
	p_core_2e_nw.slice<49>() = p_core_2e_ring.curr.slice<77>().val();
	// connection
	p_core_2e_nw.slice<48>() = p_core_2e_ring.curr.slice<78>().val();
	// connection
	p_core_2e_nw.slice<47>() = p_core_2e_ring.curr.slice<79>().val();
	// connection
	p_core_2e_nw.slice<46>() = p_core_2e_ring.curr.slice<80>().val();
	// connection
	p_core_2e_nw.slice<45>() = p_core_2e_ring.curr.slice<81>().val();
	// connection
	p_core_2e_nw.slice<44>() = p_core_2e_ring.curr.slice<82>().val();
	// connection
	p_core_2e_nw.slice<43>() = p_core_2e_ring.curr.slice<83>().val();
	// connection
	p_core_2e_nw.slice<42>() = p_core_2e_ring.curr.slice<84>().val();
	// connection
	p_core_2e_nw.slice<41>() = p_core_2e_ring.curr.slice<85>().val();
	// connection
	p_core_2e_nw.slice<40>() = p_core_2e_ring.curr.slice<86>().val();
	// connection
	p_core_2e_nw.slice<39>() = p_core_2e_ring.curr.slice<87>().val();
	// connection
	p_core_2e_nw.slice<38>() = p_core_2e_ring.curr.slice<88>().val();
	// connection
	p_core_2e_nw.slice<37>() = p_core_2e_ring.curr.slice<89>().val();
	// connection
	p_core_2e_nw.slice<36>() = p_core_2e_ring.curr.slice<90>().val();
	// connection
	p_core_2e_nw.slice<35>() = p_core_2e_ring.curr.slice<91>().val();
	// connection
	p_core_2e_nw.slice<34>() = p_core_2e_ring.curr.slice<92>().val();
	// connection
	p_core_2e_nw.slice<33>() = p_core_2e_ring.curr.slice<93>().val();
	// connection
	p_core_2e_nw.slice<32>() = p_core_2e_ring.curr.slice<94>().val();
	// connection
	p_core_2e_nw.slice<31>() = p_core_2e_ring.curr.slice<95>().val();
	// connection
	p_core_2e_nw.slice<30>() = p_core_2e_ring.curr.slice<96>().val();
	// connection
	p_core_2e_nw.slice<29>() = p_core_2e_ring.curr.slice<97>().val();
	// connection
	p_core_2e_nw.slice<28>() = p_core_2e_ring.curr.slice<98>().val();
	// connection
	p_core_2e_nw.slice<27>() = p_core_2e_ring.curr.slice<99>().val();
	// connection
	p_core_2e_nw.slice<26>() = p_core_2e_ring.curr.slice<100>().val();
	// connection
	p_core_2e_nw.slice<25>() = p_core_2e_ring.curr.slice<101>().val();
	// connection
	p_core_2e_nw.slice<24>() = p_core_2e_ring.curr.slice<102>().val();
	// connection
	p_core_2e_nw.slice<23>() = p_core_2e_ring.curr.slice<103>().val();
	// connection
	p_core_2e_nw.slice<22>() = p_core_2e_ring.curr.slice<104>().val();
	// connection
	p_core_2e_nw.slice<21>() = p_core_2e_ring.curr.slice<105>().val();
	// connection
	p_core_2e_nw.slice<20>() = p_core_2e_ring.curr.slice<106>().val();
	// connection
	p_core_2e_nw.slice<19>() = p_core_2e_ring.curr.slice<107>().val();
	// connection
	p_core_2e_nw.slice<18>() = p_core_2e_ring.curr.slice<108>().val();
	// connection
	p_core_2e_nw.slice<17>() = p_core_2e_ring.curr.slice<109>().val();
	// connection
	p_core_2e_nw.slice<16>() = p_core_2e_ring.curr.slice<110>().val();
	// connection
	p_core_2e_nw.slice<15>() = p_core_2e_ring.curr.slice<111>().val();
	// connection
	p_core_2e_nw.slice<14>() = p_core_2e_ring.curr.slice<112>().val();
	// connection
	p_core_2e_nw.slice<13>() = p_core_2e_ring.curr.slice<113>().val();
	// connection
	p_core_2e_nw.slice<12>() = p_core_2e_ring.curr.slice<114>().val();
	// connection
	p_core_2e_nw.slice<11>() = p_core_2e_ring.curr.slice<115>().val();
	// connection
	p_core_2e_nw.slice<10>() = p_core_2e_ring.curr.slice<116>().val();
	// connection
	p_core_2e_nw.slice<9>() = p_core_2e_ring.curr.slice<117>().val();
	// connection
	p_core_2e_nw.slice<8>() = p_core_2e_ring.curr.slice<118>().val();
	// connection
	p_core_2e_nw.slice<7>() = p_core_2e_ring.curr.slice<119>().val();
	// connection
	p_core_2e_nw.slice<6>() = p_core_2e_ring.curr.slice<120>().val();
	// connection
	p_core_2e_nw.slice<5>() = p_core_2e_ring.curr.slice<121>().val();
	// connection
	p_core_2e_nw.slice<4>() = p_core_2e_ring.curr.slice<122>().val();
	// connection
	p_core_2e_nw.slice<3>() = p_core_2e_ring.curr.slice<123>().val();
	// connection
	p_core_2e_nw.slice<2>() = p_core_2e_ring.curr.slice<124>().val();
	// connection
	p_core_2e_nw.slice<1>() = p_core_2e_ring.curr.slice<125>().val();
	// connection
	p_core_2e_nw.slice<0>() = p_core_2e_ring.curr.slice<126>().val();
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:46$246 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:46$245
	p_spi_2e_last__bit = logic_and<1>(p_spi_2e_rise, eq_uu<1>(p_spi_2e_bitcnt.curr, value<3>{0x7u}));
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:291$200 $flatten\core.$not$chip-v3/src/uds3_core.v:291$199
	p_core_2e_dark = (p_core_2e_pc4.slice<2>().val() ? value<8>{0x7fu} : not_u<1>(p_core_2e_pc4.slice<1>().val()).concat(p_core_2e_pc4.slice<0>()).concat(value<6>{0u}).val());
	// connection
	p_core_2e_n__ph = p_core_2e_nw.slice<63,54>().val();
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:304.22-304.59
	// cell $flatten\core.$add$chip-v3/src/uds3_core.v:304$217
	p_core_2e_qr = add_uu<6>(value<1>{0u}.concat(p_core_2e_c__env.curr.slice<7,3>()).val(), value<3>{0u}.concat(p_core_2e_c__env.curr.slice<2,0>()).val());
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:305.22-305.42
	// cell $flatten\core.$lt$chip-v3/src/uds3_core.v:305$218
	p_core_2e_w8 = lt_uu<1>(p_core_2e_t.curr, value<1>{0u}.concat(p_core_2e_c__env.curr.slice<7,3>()).val());
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:133.22-133.46
	// cell $flatten\core.$xor$chip-v3/src/uds3_core.v:133$62
	i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_133_24_62__Y = xor_uu<8>(p_core_2e_n__ph.slice<8,1>().val(), p_core_2e_n__ph.slice<9>().val().repeat<8>().val());
	// cells $flatten\core.$or$chip-v3/src/uds3_core.v:302$216 $flatten\core.$lt$chip-v3/src/uds3_core.v:302$215 $flatten\core.$reduce_and$chip-v3/src/uds3_core.v:302$214
	p_core_2e_sel__n = or_uu<1>(reduce_and<1>(p_core_2e_c__mix.curr), lt_uu<1>(p_core_2e_t.curr.slice<0>().concat(p_core_2e_t.curr.slice<1>()).concat(p_core_2e_t.curr.slice<2>()).val(), p_core_2e_c__mix.curr));
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:295$213 $flatten\core.$eq$chip-v3/src/uds3_core.v:295$208 $flatten\core.$ternary$chip-v3/src/uds3_core.v:291$200 $flatten\core.$not$chip-v3/src/uds3_core.v:291$199 $flatten\core.$ternary$chip-v3/src/uds3_core.v:295$212 $flatten\core.$eq$chip-v3/src/uds3_core.v:295$209 $flatten\core.$ternary$chip-v3/src/uds3_core.v:292$201 $flatten\core.$ternary$chip-v3/src/uds3_core.v:296$211 $flatten\core.$eq$chip-v3/src/uds3_core.v:296$210 $flatten\core.$ternary$chip-v3/src/uds3_core.v:293$204 $flatten\core.$eq$chip-v3/src/uds3_core.v:293$202 $flatten\core.$ternary$chip-v3/src/uds3_core.v:293$203 $flatten\core.$ternary$chip-v3/src/uds3_core.v:294$207 $flatten\core.$xor$chip-v3/src/uds3_core.v:294$206 $flatten\core.$xor$chip-v3/src/uds3_core.v:294$205
	p_core_2e_noise = (logic_not<1>(p_core_2e_c__color.curr) ? p_core_2e_dark : (eq_uu<1>(p_core_2e_c__color.curr, value<2>{0x1u}) ? p_core_2e_white : (eq_uu<1>(p_core_2e_c__color.curr, value<2>{0x2u}) ? p_core_2e_brite : p_core_2e_metal)));
	// connection
	p_core_2e_fold = i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_133_24_62__Y;
	// connection
	p_core_2e_tail = (p_core_2e_clearing.curr ? value<1>{0u} : (p_core_2e_clearing.curr ? value<1>{0u} : (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y ? p_core_2e_cbit : (p_core_2e_clearing.curr ? value<1>{0u} : (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y ? value<1>{0u} : (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_246_24_170__Y ? logic_and<1>(logic_not<1>(p_core_2e_kill.curr), (p_core_2e_c__dec.curr ? p_core_2e_sub__out : p_core_2e_head)) : (p_core_2e_clearing.curr ? value<1>{0u} : (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y ? value<1>{0u} : (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_246_24_170__Y ? value<1>{0u} : (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_247_24_174__Y ? (p_core_2e_c__adec.curr ? p_core_2e_sub__out : p_core_2e_head) : (p_core_2e_clearing.curr ? value<1>{0u} : (i_flatten_5c_core_2e__24_logic__and_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_245_24_169__Y ? value<1>{0u} : (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_246_24_170__Y ? value<1>{0u} : (i_flatten_5c_core_2e__24_eq_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_247_24_174__Y ? value<1>{0u} : (eq_uu<1>(p_core_2e_t.curr.slice<5,4>().val(), value<2>{0x3u}) ? i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_180_24_113__Y : p_core_2e_ring.curr.slice<127>().val())))))))))))))));
	// connection
	p_spi_2e_byte__in = p_spi_2e_rx.curr.slice<6,0>().concat(p_spi_2e_mosi__s.curr).val();
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:52$257 $flatten\spi.$le$chip-v3/src/uds3_spi.v:52$256 $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:52$255 $flatten\spi.$ne$chip-v3/src/uds3_spi.v:52$254 $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:52$253
	p_spi_2e_byte__done = logic_and<1>(logic_and<1>(logic_and<1>(p_spi_2e_last__bit, p_spi_2e_is__hit.curr), reduce_bool<1>(p_spi_2e_bytecnt.curr)), le_uu<1>(p_spi_2e_bytecnt.curr, value<3>{0x4u}));
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:307$223 $flatten\core.$or$chip-v3/src/uds3_core.v:302$216 $flatten\core.$lt$chip-v3/src/uds3_core.v:302$215 $flatten\core.$reduce_and$chip-v3/src/uds3_core.v:302$214 $flatten\core.$ternary$chip-v3/src/uds3_core.v:295$213 $flatten\core.$eq$chip-v3/src/uds3_core.v:295$208 $flatten\core.$ternary$chip-v3/src/uds3_core.v:291$200 $flatten\core.$not$chip-v3/src/uds3_core.v:291$199 $flatten\core.$ternary$chip-v3/src/uds3_core.v:295$212 $flatten\core.$eq$chip-v3/src/uds3_core.v:295$209 $flatten\core.$ternary$chip-v3/src/uds3_core.v:292$201 $flatten\core.$ternary$chip-v3/src/uds3_core.v:296$211 $flatten\core.$eq$chip-v3/src/uds3_core.v:296$210 $flatten\core.$ternary$chip-v3/src/uds3_core.v:293$204 $flatten\core.$eq$chip-v3/src/uds3_core.v:293$202 $flatten\core.$ternary$chip-v3/src/uds3_core.v:293$203 $flatten\core.$ternary$chip-v3/src/uds3_core.v:294$207 $flatten\core.$xor$chip-v3/src/uds3_core.v:294$206 $flatten\core.$xor$chip-v3/src/uds3_core.v:294$205 $flatten\core.$ternary$chip-v3/src/uds3_core.v:307$222
	p_core_2e_src = (p_core_2e_sel__n ? p_core_2e_noise : (p_core_2e_c__clap.curr ? value<8>{0u} : p_core_2e_c__tone.curr));
	// cells $flatten\core.$logic_and$chip-v3/src/uds3_core.v:306$221 $flatten\core.$lt$chip-v3/src/uds3_core.v:306$220 $flatten\core.$add$chip-v3/src/uds3_core.v:304$217 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:306$219
	p_core_2e_w1 = logic_and<1>(logic_not<1>(p_core_2e_w8), lt_uu<1>(p_core_2e_t.curr, p_core_2e_qr));
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:55.22-55.24
	// cell $flatten\core.$reduce_and$chip-v3/src/uds3_core.v:55$36
	p_core_2e_wend = reduce_and<1>(p_core_2e_t.curr);
	// connection
	p_core_2e_w0.slice<63>() = p_core_2e_ring.curr.slice<64>().val();
	// connection
	p_core_2e_w0.slice<62>() = p_core_2e_ring.curr.slice<65>().val();
	// connection
	p_core_2e_w0.slice<61>() = p_core_2e_ring.curr.slice<66>().val();
	// connection
	p_core_2e_w0.slice<60>() = p_core_2e_ring.curr.slice<67>().val();
	// connection
	p_core_2e_w0.slice<59>() = p_core_2e_ring.curr.slice<68>().val();
	// connection
	p_core_2e_w0.slice<58>() = p_core_2e_ring.curr.slice<69>().val();
	// connection
	p_core_2e_w0.slice<57>() = p_core_2e_ring.curr.slice<70>().val();
	// connection
	p_core_2e_w0.slice<56>() = p_core_2e_ring.curr.slice<71>().val();
	// connection
	p_core_2e_w0.slice<55>() = p_core_2e_ring.curr.slice<72>().val();
	// connection
	p_core_2e_w0.slice<54>() = p_core_2e_ring.curr.slice<73>().val();
	// connection
	p_core_2e_w0.slice<53>() = p_core_2e_ring.curr.slice<74>().val();
	// connection
	p_core_2e_w0.slice<52>() = p_core_2e_ring.curr.slice<75>().val();
	// connection
	p_core_2e_w0.slice<51>() = p_core_2e_ring.curr.slice<76>().val();
	// connection
	p_core_2e_w0.slice<50>() = p_core_2e_ring.curr.slice<77>().val();
	// connection
	p_core_2e_w0.slice<49>() = p_core_2e_ring.curr.slice<78>().val();
	// connection
	p_core_2e_w0.slice<48>() = p_core_2e_ring.curr.slice<79>().val();
	// connection
	p_core_2e_w0.slice<47>() = p_core_2e_ring.curr.slice<80>().val();
	// connection
	p_core_2e_w0.slice<46>() = p_core_2e_ring.curr.slice<81>().val();
	// connection
	p_core_2e_w0.slice<45>() = p_core_2e_ring.curr.slice<82>().val();
	// connection
	p_core_2e_w0.slice<44>() = p_core_2e_ring.curr.slice<83>().val();
	// connection
	p_core_2e_w0.slice<43>() = p_core_2e_ring.curr.slice<84>().val();
	// connection
	p_core_2e_w0.slice<42>() = p_core_2e_ring.curr.slice<85>().val();
	// connection
	p_core_2e_w0.slice<41>() = p_core_2e_ring.curr.slice<86>().val();
	// connection
	p_core_2e_w0.slice<40>() = p_core_2e_ring.curr.slice<87>().val();
	// connection
	p_core_2e_w0.slice<39>() = p_core_2e_ring.curr.slice<88>().val();
	// connection
	p_core_2e_w0.slice<38>() = p_core_2e_ring.curr.slice<89>().val();
	// connection
	p_core_2e_w0.slice<37>() = p_core_2e_ring.curr.slice<90>().val();
	// connection
	p_core_2e_w0.slice<36>() = p_core_2e_ring.curr.slice<91>().val();
	// connection
	p_core_2e_w0.slice<35>() = p_core_2e_ring.curr.slice<92>().val();
	// connection
	p_core_2e_w0.slice<34>() = p_core_2e_ring.curr.slice<93>().val();
	// connection
	p_core_2e_w0.slice<33>() = p_core_2e_ring.curr.slice<94>().val();
	// connection
	p_core_2e_w0.slice<32>() = p_core_2e_ring.curr.slice<95>().val();
	// connection
	p_core_2e_w0.slice<31>() = p_core_2e_ring.curr.slice<96>().val();
	// connection
	p_core_2e_w0.slice<30>() = p_core_2e_ring.curr.slice<97>().val();
	// connection
	p_core_2e_w0.slice<29>() = p_core_2e_ring.curr.slice<98>().val();
	// connection
	p_core_2e_w0.slice<28>() = p_core_2e_ring.curr.slice<99>().val();
	// connection
	p_core_2e_w0.slice<27>() = p_core_2e_ring.curr.slice<100>().val();
	// connection
	p_core_2e_w0.slice<26>() = p_core_2e_ring.curr.slice<101>().val();
	// connection
	p_core_2e_w0.slice<25>() = p_core_2e_ring.curr.slice<102>().val();
	// connection
	p_core_2e_w0.slice<24>() = p_core_2e_ring.curr.slice<103>().val();
	// connection
	p_core_2e_w0.slice<23>() = p_core_2e_ring.curr.slice<104>().val();
	// connection
	p_core_2e_w0.slice<22>() = p_core_2e_ring.curr.slice<105>().val();
	// connection
	p_core_2e_w0.slice<21>() = p_core_2e_ring.curr.slice<106>().val();
	// connection
	p_core_2e_w0.slice<20>() = p_core_2e_ring.curr.slice<107>().val();
	// connection
	p_core_2e_w0.slice<19>() = p_core_2e_ring.curr.slice<108>().val();
	// connection
	p_core_2e_w0.slice<18>() = p_core_2e_ring.curr.slice<109>().val();
	// connection
	p_core_2e_w0.slice<17>() = p_core_2e_ring.curr.slice<110>().val();
	// connection
	p_core_2e_w0.slice<16>() = p_core_2e_ring.curr.slice<111>().val();
	// connection
	p_core_2e_w0.slice<15>() = p_core_2e_ring.curr.slice<112>().val();
	// connection
	p_core_2e_w0.slice<14>() = p_core_2e_ring.curr.slice<113>().val();
	// connection
	p_core_2e_w0.slice<13>() = p_core_2e_ring.curr.slice<114>().val();
	// connection
	p_core_2e_w0.slice<12>() = p_core_2e_ring.curr.slice<115>().val();
	// connection
	p_core_2e_w0.slice<11>() = p_core_2e_ring.curr.slice<116>().val();
	// connection
	p_core_2e_w0.slice<10>() = p_core_2e_ring.curr.slice<117>().val();
	// connection
	p_core_2e_w0.slice<9>() = p_core_2e_ring.curr.slice<118>().val();
	// connection
	p_core_2e_w0.slice<8>() = p_core_2e_ring.curr.slice<119>().val();
	// connection
	p_core_2e_w0.slice<7>() = p_core_2e_ring.curr.slice<120>().val();
	// connection
	p_core_2e_w0.slice<6>() = p_core_2e_ring.curr.slice<121>().val();
	// connection
	p_core_2e_w0.slice<5>() = p_core_2e_ring.curr.slice<122>().val();
	// connection
	p_core_2e_w0.slice<4>() = p_core_2e_ring.curr.slice<123>().val();
	// connection
	p_core_2e_w0.slice<3>() = p_core_2e_ring.curr.slice<124>().val();
	// connection
	p_core_2e_w0.slice<2>() = p_core_2e_ring.curr.slice<125>().val();
	// connection
	p_core_2e_w0.slice<1>() = p_core_2e_ring.curr.slice<126>().val();
	// connection
	p_core_2e_w0.slice<0>() = p_core_2e_ring.curr.slice<127>().val();
	// connection
	p_core_2e_p__aux = p_core_2e_tail.concat(p_core_2e_ring.curr.slice<0>()).concat(p_core_2e_ring.curr.slice<1>()).concat(p_core_2e_ring.curr.slice<2>()).concat(p_core_2e_ring.curr.slice<3>()).concat(p_core_2e_ring.curr.slice<4>()).concat(p_core_2e_ring.curr.slice<5>()).concat(p_core_2e_ring.curr.slice<6>()).val();
	// connection
	p_core_2e_p__bend = p_core_2e_ring.curr.slice<30,29>().val();
	// connection
	p_core_2e_n__wave = p_core_2e_nw.slice<12>().concat(p_core_2e_nw.slice<13>()).val();
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:134.23-134.31
	// cell $flatten\core.$not$chip-v3/src/uds3_core.v:134$63
	p_core_2e_trw = not_u<1>(p_core_2e_fold.slice<7>().val()).concat(p_core_2e_fold.slice<6,0>()).val();
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:48$248 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:48$247
	p_spi_2e_cmd__end = logic_and<1>(p_spi_2e_last__bit, logic_not<1>(p_spi_2e_bytecnt.curr));
	// connection
	p_core_2e_z__bt = p_core_2e_w0.slice<19>().concat(p_core_2e_w0.slice<20>()).concat(p_core_2e_w0.slice<21>()).val();
	// connection
	i_flatten_5c_core_2e__24_not_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_135_24_65__Y = i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_133_24_62__Y.slice<7>().val();
	// connection
	p_core_2e_n__aux = p_core_2e_nw.slice<47,40>().val();
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:56.22-56.30
	// cell $flatten\core.$and$chip-v3/src/uds3_core.v:56$37
	p_core_2e_fend = and_uu<1>(p_core_2e_wend, p_core_2e_v.curr);
	// connection
	p_core_2e_z__lin = and_uu<1>(p_core_2e_w0.slice<22>().val(), p_core_2e_w0.slice<23>().val());
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:136$69 $flatten\core.$xor$chip-v3/src/uds3_core.v:136$68 $flatten\core.$xor$chip-v3/src/uds3_core.v:136$67
	p_core_2e_sqb = (p_core_2e_n__wave.slice<0>().val() ? xor_uu<1>(xor_uu<1>(p_core_2e_n__ph.slice<9>().val(), p_core_2e_frame.curr.slice<0>().val()), p_core_2e_frame.curr.slice<2>().val()) : p_core_2e_n__ph.slice<9>().val());
	// connection
	p_core_2e_n__mix = p_core_2e_nw.slice<24>().concat(p_core_2e_nw.slice<25>()).concat(p_core_2e_nw.slice<26>()).val();
	// connection
	p_core_2e_n__mode = p_core_2e_nw.slice<22>().concat(p_core_2e_nw.slice<23>()).val();
	// connection
	p_core_2e_a3 = p_core_2e_n__aux.slice<7,5>().val();
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:50$250 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:50$249
	p_spi_2e_hit__cmd = logic_and<1>(p_spi_2e_cmd__end, eq_uu<1>(p_spi_2e_byte__in.slice<7,3>().val(), value<5>{0x3u}));
	// cells $procmux$282 $procmux$285 $procmux$288 $procmux$291 $procmux$294 $procmux$297 $procmux$300 $procmux$303 $procmux$306 $procmux$309 $procmux$312 $procmux$315 $procmux$318
	p_core_2e_tz = (p_core_2e_frame.curr.slice<0>().val() ? value<4>{0u} : (p_core_2e_frame.curr.slice<1>().val() ? value<4>{0x1u} : (p_core_2e_frame.curr.slice<2>().val() ? value<4>{0x2u} : (p_core_2e_frame.curr.slice<3>().val() ? value<4>{0x3u} : (p_core_2e_frame.curr.slice<4>().val() ? value<4>{0x4u} : (p_core_2e_frame.curr.slice<5>().val() ? value<4>{0x5u} : (p_core_2e_frame.curr.slice<6>().val() ? value<4>{0x6u} : (p_core_2e_frame.curr.slice<7>().val() ? value<4>{0x7u} : (p_core_2e_frame.curr.slice<8>().val() ? value<4>{0x8u} : (p_core_2e_frame.curr.slice<9>().val() ? value<4>{0x9u} : (p_core_2e_frame.curr.slice<10>().val() ? value<4>{0xau} : (p_core_2e_frame.curr.slice<11>().val() ? value<4>{0xbu} : (p_core_2e_frame.curr.slice<12>().val() ? value<4>{0xcu} : value<4>{0xdu})))))))))))));
	// connection
	p_core_2e_z__decay = p_core_2e_w0.slice<8>().concat(p_core_2e_w0.slice<9>()).concat(p_core_2e_w0.slice<10>()).concat(p_core_2e_w0.slice<11>()).val();
	// cells $flatten\core.$add$chip-v3/src/uds3_core.v:128$59 $flatten\core.$and$chip-v3/src/uds3_core.v:128$58 $flatten\core.$and$chip-v3/src/uds3_core.v:128$57
	p_core_2e_off = add_uu<8>(and_uu<8>(p_core_2e_p__bend.slice<1>().val().repeat<8>().val(), value<1>{0u}.concat(p_core_2e_p__aux.slice<7,1>()).val()), and_uu<8>(p_core_2e_p__bend.slice<0>().val().repeat<8>().val(), value<2>{0u}.concat(p_core_2e_p__aux.slice<7,2>()).val()));
	// connection
	p_core_2e_p__pitch = p_core_2e_ring.curr.slice<46,39>().val();
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:135$66 $flatten\core.$xor$chip-v3/src/uds3_core.v:135$64
	p_core_2e_drv = (xor_uu<1>(p_core_2e_trw.slice<7>().val(), p_core_2e_trw.slice<6>().val()) ? p_core_2e_trw.slice<7>().concat(i_flatten_5c_core_2e__24_not_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_135_24_65__Y.repeat<7>()).val() : p_core_2e_trw.slice<6,0>().concat(value<1>{0u}).val());
	// cells $flatten\spi.$logic_and$chip-v3/src/uds3_spi.v:51$252 $flatten\spi.$eq$chip-v3/src/uds3_spi.v:51$251
	p_spi_2e_stop = logic_and<1>(p_spi_2e_cmd__end, eq_uu<1>(p_spi_2e_byte__in, value<8>{0x40u}));
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:308$226 $flatten\core.$ternary$chip-v3/src/uds3_core.v:309$225 $flatten\core.$ternary$chip-v3/src/uds3_core.v:310$224 $flatten\core.$logic_and$chip-v3/src/uds3_core.v:306$221 $flatten\core.$lt$chip-v3/src/uds3_core.v:306$220 $flatten\core.$add$chip-v3/src/uds3_core.v:304$217 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:306$219
	p_core_2e_x = (p_core_2e_clearing.curr ? value<8>{0u} : (p_core_2e_w8 ? p_core_2e_src : (p_core_2e_w1 ? p_core_2e_src.slice<7>().val().repeat<3>().concat(p_core_2e_src.slice<7,3>()).val() : value<8>{0u})));
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:92$44 $flatten\core.$add$chip-v3/src/uds3_core.v:92$43
	p_core_2e_z__ad = (p_core_2e_z__lin ? value<1>{0u}.concat(p_core_2e_z__bt).val() : add_uu<4>(value<1>{0u}.concat(p_core_2e_z__bt).val(), value<4>{0x3u}));
	// connection
	p_core_2e_z__aux = p_core_2e_w0.slice<47,40>().val();
	// cells $procmux$484 $procmux$481 $procmux$478 $procmux$475 $procmux$472 $procmux$469 $procmux$466 $procmux$463 $procmux$460 $procmux$457 $flatten\core.$lt$chip-v3/src/uds3_core.v:277$192
	p_core_2e_choice = (p_core_2e_same0 ? value<1>{0u} : (p_core_2e_same0 ? value<1>{0u} : (p_core_2e_same1 ? value<1>{0x1u} : (p_core_2e_same0 ? value<1>{0u} : (p_core_2e_same1 ? value<1>{0u} : (i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_179__Y ? (p_core_2e_same0 ? value<1>{0u} : (p_core_2e_same1 ? value<1>{0u} : (i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_179__Y ? (i_flatten_5c_core_2e__24_reduce__or_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_269_24_180__Y ? lt_uu<1>(p_core_2e_e1.slice<7,5>().val(), p_core_2e_e0.slice<7,5>().val()) : value<1>{0x1u}) : value<1>{0u}))) : value<1>{0u}))))));
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:320.23-320.33
	// cell $flatten\core.$not$chip-v3/src/uds3_core.v:320$227
	p_core_2e_y = not_u<1>(p_core_2e_sd__v2.curr.slice<11>().val());
	// cells $flatten\core.$add$chip-v3/src/uds3_core.v:129$60 $flatten\core.$add$chip-v3/src/uds3_core.v:128$59 $flatten\core.$and$chip-v3/src/uds3_core.v:128$58 $flatten\core.$and$chip-v3/src/uds3_core.v:128$57
	p_core_2e_pe__raw = add_uu<9>(value<1>{0u}.concat(p_core_2e_p__pitch).val(), value<2>{0u}.concat(p_core_2e_off.slice<7,1>()).val());
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:321.32-321.37
	// cell $flatten\core.$not$chip-v3/src/uds3_core.v:321$228
	p_core_2e_x__fb = p_core_2e_y.repeat<3>().concat(not_u<1>(p_core_2e_x.slice<7>().val())).concat(p_core_2e_x).val();
	// cells $flatten\core.$logic_or$chip-v3/src/uds3_core.v:327$239 $flatten\core.$logic_and$chip-v3/src/uds3_core.v:327$238 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:327$237 $flatten\core.$logic_and$chip-v3/src/uds3_core.v:327$236 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:327$235 $flatten\core.$logic_not$chip-v3/src/uds3_core.v:327$234
	p_core_2e_sd__restart = logic_or<1>(logic_not<1>(p_rst__n), logic_and<1>(logic_and<1>(p_core_2e_fend, logic_not<1>(p_core_2e_act0)), logic_not<1>(p_core_2e_act1)));
	// connection
	p_core_2e_lo = add_uu<10>(value<1>{0u}.concat(p_core_2e_sd__v2.curr.slice<8,0>()).val(), value<1>{0u}.concat(p_core_2e_sd__v1.curr.slice<8,0>()).val());
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:195.23-195.32
	// cell $flatten\core.$or$chip-v3/src/uds3_core.v:195$125
	p_core_2e_busy = or_uu<1>(p_core_2e_pend.curr, p_core_2e_hv.curr);
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:196.23-196.25
	// cell $flatten\core.$not$chip-v3/src/uds3_core.v:196$126
	p_core_2e_frame__sync = not_u<1>(p_core_2e_v.curr);
	// \src: chip-v3/src/project.v:32.5-45.4|chip-v3/src/uds3_spi.v:53.22-53.36
	// cell $flatten\spi.$and$chip-v3/src/uds3_spi.v:53$258
	p_spi_2e_miso = and_uu<1>(p_spi_2e_active, p_spi_2e_rx.curr.slice<7>().val());
	// cells $flatten\core.$add$chip-v3/src/uds3_core.v:324$233 $flatten\core.$add$chip-v3/src/uds3_core.v:324$232 $flatten\core.$add$chip-v3/src/uds3_core.v:324$231
	p_core_2e_hi = add_uu<3>(add_uu<3>(add_uu<3>(p_core_2e_sd__v2.curr.slice<11,9>().val(), p_core_2e_sd__v1.curr.slice<10>().concat(p_core_2e_sd__v1.curr.slice<10,9>()).val()), p_core_2e_y.repeat<2>().concat(value<1>{0x1u}).val()), value<2>{0u}.concat(p_core_2e_lo.slice<9>()).val());
	// cells $flatten\core.$add$chip-v3/src/uds3_core.v:322$229 $flatten\core.$not$chip-v3/src/uds3_core.v:321$228
	p_core_2e_s1 = add_uu<12>(p_core_2e_sd__v1.curr.slice<10>().concat(p_core_2e_sd__v1.curr).val(), p_core_2e_x__fb);
	// cells $procmux$540 $procmux$541_CMP0 $procmux$542_CMP0 $procmux$543_CMP0 $procmux$544_CMP0 $procmux$545_CMP0 $procmux$546_CMP0 $procmux$547_CMP0
	p_digit = (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x6u}) ? value<7>{0x7du} : (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x5u}) ? value<7>{0x6du} : (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x4u}) ? value<7>{0x66u} : (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x3u}) ? value<7>{0x4fu} : (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x2u}) ? value<7>{0x5bu} : (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x1u}) ? value<7>{0x6u} : (logic_not<1>(p_spi_2e_ch.curr) ? value<7>{0x3fu} : value<7>{0x7u})))))));
	// connection
	p_core_2e_v2__n = p_core_2e_hi.concat(p_core_2e_lo.slice<8,0>()).val();
	// connection
	p_core_2e_v1__n = p_core_2e_s1.slice<10,0>().val();
	// cells $flatten\core.$xor$chip-v3/src/uds3_core.v:180$113 $flatten\core.$xor$chip-v3/src/uds3_core.v:180$112
	p_core_2e_ph__new = i_flatten_5c_core_2e__24_xor_24_chip_2d_v3_2f_src_2f_uds3__core_2e_v_3a_180_24_113__Y;
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:143$88 $flatten\core.$eq$chip-v3/src/uds3_core.v:143$75 $flatten\core.$ternary$chip-v3/src/uds3_core.v:143$79 $flatten\core.$gt$chip-v3/src/uds3_core.v:143$77 $flatten\core.$not$chip-v3/src/uds3_core.v:143$76 $flatten\core.$not$chip-v3/src/uds3_core.v:143$78 $flatten\core.$ternary$chip-v3/src/uds3_core.v:144$87 $flatten\core.$eq$chip-v3/src/uds3_core.v:144$80 $flatten\core.$ternary$chip-v3/src/uds3_core.v:144$82 $flatten\core.$lt$chip-v3/src/uds3_core.v:144$81 $flatten\core.$ternary$chip-v3/src/uds3_core.v:145$86 $flatten\core.$eq$chip-v3/src/uds3_core.v:145$83 $flatten\core.$ternary$chip-v3/src/uds3_core.v:145$85 $flatten\core.$ne$chip-v3/src/uds3_core.v:145$84
	p_core_2e_n__meff = (eq_uu<1>(p_core_2e_n__mode, value<2>{0x1u}) ? (gt_uu<1>(p_core_2e_n__mix, not_u<3>(p_core_2e_a3)) ? p_core_2e_n__mix : not_u<3>(p_core_2e_a3)) : (eq_uu<1>(p_core_2e_n__mode, value<2>{0x2u}) ? (lt_uu<1>(p_core_2e_n__mix, p_core_2e_a3) ? p_core_2e_n__mix : p_core_2e_a3) : (eq_uu<1>(p_core_2e_n__mode, value<2>{0x3u}) ? (reduce_bool<1>(p_core_2e_n__aux.slice<7,6>().val()) ? p_core_2e_n__aux.slice<5,3>().val() : p_core_2e_n__mix) : p_core_2e_n__mix)));
	// cells $flatten\core.$ternary$chip-v3/src/uds3_core.v:137$74 $flatten\core.$eq$chip-v3/src/uds3_core.v:137$70 $flatten\core.$ternary$chip-v3/src/uds3_core.v:138$73 $flatten\core.$eq$chip-v3/src/uds3_core.v:138$71 $flatten\core.$ternary$chip-v3/src/uds3_core.v:135$66 $flatten\core.$xor$chip-v3/src/uds3_core.v:135$64 $flatten\core.$ternary$chip-v3/src/uds3_core.v:139$72 $flatten\core.$ternary$chip-v3/src/uds3_core.v:136$69 $flatten\core.$xor$chip-v3/src/uds3_core.v:136$68 $flatten\core.$xor$chip-v3/src/uds3_core.v:136$67
	p_core_2e_n__tone = (logic_not<1>(p_core_2e_n__wave) ? p_core_2e_trw : (eq_uu<1>(p_core_2e_n__wave, value<2>{0x1u}) ? p_core_2e_drv : (p_core_2e_sqb ? value<8>{0x80u} : value<8>{0x7fu})));
	// \src: chip-v3/src/project.v:47.13-59.4|chip-v3/src/uds3_core.v:130.25-130.56
	// cell $flatten\core.$ternary$chip-v3/src/uds3_core.v:130$61
	p_core_2e_p__pe = (p_core_2e_pe__raw.slice<8>().val() ? value<8>{0xffu} : p_core_2e_pe__raw.slice<7,0>().val());
	// connection
	p_core_2e_n__env = p_core_2e_nw.slice<39,32>().val();
	// connection
	p_core_2e_n__bend = p_core_2e_nw.slice<16>().concat(p_core_2e_nw.slice<17>()).val();
	// connection
	p_core_2e_n__color = p_core_2e_nw.slice<14>().concat(p_core_2e_nw.slice<15>()).val();
	// connection
	p_core_2e_n__pitch = p_core_2e_nw.slice<0>().concat(p_core_2e_nw.slice<1>()).concat(p_core_2e_nw.slice<2>()).concat(p_core_2e_nw.slice<3>()).concat(p_core_2e_nw.slice<4>()).concat(p_core_2e_nw.slice<5>()).concat(p_core_2e_nw.slice<6>()).concat(p_core_2e_nw.slice<7>()).val();
	// connection
	p_spi_2e_cs__n__pin = p_uio__in.slice<0>().val();
	// connection
	p_spi_2e_sck__pin = p_uio__in.slice<3>().val();
	// connection
	p_spi_2e_mosi__pin = p_uio__in.slice<1>().val();
}

CXXRTL_EXTREMELY_COLD
void p_tt__um__ai__wrangler__uds3::debug_info(debug_items &items, std::string path) {
	assert(path.empty() || path[path.size() - 1] == ' ');
	items.add(path + "core clk", debug_item(debug_alias(), p_clk, 0));
	items.add(path + "core rst_n", debug_item(debug_alias(), p_rst__n, 0));
	items.add(path + "core hit_cmd", debug_item(debug_eval_outline, p_spi_2e_hit__cmd, 0));
	items.add(path + "core stop", debug_item(debug_eval_outline, p_spi_2e_stop, 0));
	items.add(path + "core hit_ch", debug_item(debug_alias(), p_spi_2e_ch, 0));
	items.add(path + "core byte_done", debug_item(debug_eval_outline, p_spi_2e_byte__done, 0));
	items.add(path + "core byte_idx", debug_item(debug_alias(), p_spi_2e_bytecnt, 0));
	items.add(path + "core hold", debug_item(debug_alias(), p_spi_2e_rx, 0));
	items.add(path + "core audio", debug_item(debug_eval_outline, p_core_2e_y, 0));
	items.add(path + "core busy", debug_item(debug_eval_outline, p_core_2e_busy, 0));
	items.add(path + "core frame_sync", debug_item(debug_eval_outline, p_core_2e_frame__sync, 0));
	items.add(path + "core t", debug_item(p_core_2e_t, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core v", debug_item(p_core_2e_v, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core frame", debug_item(p_core_2e_frame, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core clearing", debug_item(p_core_2e_clearing, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core wend", debug_item(debug_eval_outline, p_core_2e_wend, 0));
	items.add(path + "core fend", debug_item(debug_eval_outline, p_core_2e_fend, 0));
	items.add(path + "core r", debug_item(debug_eval_outline, p_core_2e_r, 0));
	items.add(path + "core j", debug_item(debug_eval_outline, p_core_2e_j, 0));
	items.add(path + "core ring", debug_item(p_core_2e_ring, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core tail", debug_item(debug_eval_outline, p_core_2e_tail, 0));
	items.add(path + "core head", debug_item(debug_eval_outline, p_core_2e_head, 0));
	items.add(path + "core w0", debug_item(debug_eval_outline, p_core_2e_w0, 0));
	items.add(path + "core nw", debug_item(debug_eval_outline, p_core_2e_nw, 0));
	items.add(path + "core z_decay", debug_item(debug_eval_outline, p_core_2e_z__decay, 0));
	items.add(path + "core z_bt", debug_item(debug_eval_outline, p_core_2e_z__bt, 0));
	items.add(path + "core z_lin", debug_item(debug_eval_outline, p_core_2e_z__lin, 0));
	items.add(path + "core z_aux", debug_item(debug_eval_outline, p_core_2e_z__aux, 0));
	items.add(path + "core z_ad", debug_item(debug_eval_outline, p_core_2e_z__ad, 0));
	items.add(path + "core tz", debug_item(debug_eval_outline, p_core_2e_tz, 0));
	static const value<32> const_p_core_2e_k = value<32>{0xffffffffu};
	items.add(path + "core k", debug_item(const_p_core_2e_k, 0));
	items.add(path + "core c_env", debug_item(p_core_2e_c__env, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_dec", debug_item(p_core_2e_c__dec, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_adec", debug_item(p_core_2e_c__adec, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_alt8", debug_item(p_core_2e_c__alt8, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_lin", debug_item(p_core_2e_c__lin, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core n_pitch", debug_item(debug_eval_outline, p_core_2e_n__pitch, 0));
	items.add(path + "core n_wave", debug_item(debug_eval_outline, p_core_2e_n__wave, 0));
	items.add(path + "core n_color", debug_item(debug_eval_outline, p_core_2e_n__color, 0));
	items.add(path + "core n_bend", debug_item(debug_eval_outline, p_core_2e_n__bend, 0));
	items.add(path + "core n_mode", debug_item(debug_eval_outline, p_core_2e_n__mode, 0));
	items.add(path + "core n_mix", debug_item(debug_eval_outline, p_core_2e_n__mix, 0));
	items.add(path + "core n_env", debug_item(debug_eval_outline, p_core_2e_n__env, 0));
	items.add(path + "core n_aux", debug_item(debug_eval_outline, p_core_2e_n__aux, 0));
	items.add(path + "core n_ph", debug_item(debug_eval_outline, p_core_2e_n__ph, 0));
	items.add(path + "core p_pitch", debug_item(debug_eval_outline, p_core_2e_p__pitch, 0));
	items.add(path + "core p_bend", debug_item(debug_eval_outline, p_core_2e_p__bend, 0));
	items.add(path + "core p_aux", debug_item(debug_eval_outline, p_core_2e_p__aux, 0));
	items.add(path + "core off", debug_item(debug_eval_outline, p_core_2e_off, 0));
	items.add(path + "core pe_raw", debug_item(debug_eval_outline, p_core_2e_pe__raw, 0));
	items.add(path + "core p_pe", debug_item(debug_eval_outline, p_core_2e_p__pe, 0));
	items.add(path + "core fold", debug_item(debug_eval_outline, p_core_2e_fold, 0));
	items.add(path + "core trw", debug_item(debug_eval_outline, p_core_2e_trw, 0));
	items.add(path + "core drv", debug_item(debug_eval_outline, p_core_2e_drv, 0));
	items.add(path + "core sqb", debug_item(debug_eval_outline, p_core_2e_sqb, 0));
	items.add(path + "core n_tone", debug_item(debug_eval_outline, p_core_2e_n__tone, 0));
	items.add(path + "core a3", debug_item(debug_eval_outline, p_core_2e_a3, 0));
	items.add(path + "core n_meff", debug_item(debug_eval_outline, p_core_2e_n__meff, 0));
	items.add(path + "core c_tone", debug_item(p_core_2e_c__tone, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_clap", debug_item(p_core_2e_c__clap, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_mix", debug_item(p_core_2e_c__mix, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_color", debug_item(p_core_2e_c__color, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core bor", debug_item(p_core_2e_bor, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core is_aux", debug_item(debug_eval_outline, p_core_2e_is__aux, 0));
	items.add(path + "core sml", debug_item(debug_eval_outline, p_core_2e_sml, 0));
	items.add(path + "core d_bit", debug_item(debug_eval_outline, p_core_2e_d__bit, 0));
	items.add(path + "core bor_in", debug_item(debug_eval_outline, p_core_2e_bor__in, 0));
	items.add(path + "core sub_out", debug_item(debug_eval_outline, p_core_2e_sub__out, 0));
	items.add(path + "core cy", debug_item(p_core_2e_cy, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core pj", debug_item(debug_eval_outline, p_core_2e_pj, 0));
	items.add(path + "core pk", debug_item(debug_eval_outline, p_core_2e_pk, 0));
	items.add(path + "core mant", debug_item(debug_eval_outline, p_core_2e_mant, 0));
	items.add(path + "core inc_bit", debug_item(debug_eval_outline, p_core_2e_inc__bit, 0));
	items.add(path + "core cy_in", debug_item(debug_eval_outline, p_core_2e_cy__in, 0));
	items.add(path + "core ph_new", debug_item(debug_eval_outline, p_core_2e_ph__new, 0));
	items.add(path + "core pend", debug_item(p_core_2e_pend, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core tgt", debug_item(p_core_2e_tgt, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core hv", debug_item(p_core_2e_hv, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core con", debug_item(p_core_2e_con, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core kill", debug_item(p_core_2e_kill, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core kill_pend", debug_item(p_core_2e_kill__pend, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core cb", debug_item(p_core_2e_cb, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core choice", debug_item(debug_eval_outline, p_core_2e_choice, 0));
	items.add(path + "core cbit", debug_item(debug_eval_outline, p_core_2e_cbit, 0));
	items.add(path + "core cwr", debug_item(debug_eval_outline, p_core_2e_cwr, 0));
	items.add(path + "core e0", debug_item(debug_eval_outline, p_core_2e_e0, 0));
	items.add(path + "core e1", debug_item(debug_eval_outline, p_core_2e_e1, 0));
	items.add(path + "core h0", debug_item(debug_eval_outline, p_core_2e_h0, 0));
	items.add(path + "core h1", debug_item(debug_eval_outline, p_core_2e_h1, 0));
	items.add(path + "core hg", debug_item(debug_eval_outline, p_core_2e_hg, 0));
	items.add(path + "core act0", debug_item(debug_eval_outline, p_core_2e_act0, 0));
	items.add(path + "core act1", debug_item(debug_eval_outline, p_core_2e_act1, 0));
	items.add(path + "core same0", debug_item(debug_eval_outline, p_core_2e_same0, 0));
	items.add(path + "core same1", debug_item(debug_eval_outline, p_core_2e_same1, 0));
	items.add(path + "core lfsr", debug_item(p_core_2e_lfsr, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core pc4", debug_item(debug_eval_outline, p_core_2e_pc4, 0));
	items.add(path + "core dark", debug_item(debug_eval_outline, p_core_2e_dark, 0));
	items.add(path + "core white", debug_item(debug_eval_outline, p_core_2e_white, 0));
	items.add(path + "core brite", debug_item(debug_eval_outline, p_core_2e_brite, 0));
	items.add(path + "core metal", debug_item(debug_eval_outline, p_core_2e_metal, 0));
	items.add(path + "core noise", debug_item(debug_eval_outline, p_core_2e_noise, 0));
	items.add(path + "core sel_n", debug_item(debug_eval_outline, p_core_2e_sel__n, 0));
	items.add(path + "core amp", debug_item(debug_alias(), p_core_2e_c__env, 0));
	items.add(path + "core qr", debug_item(debug_eval_outline, p_core_2e_qr, 0));
	items.add(path + "core w8", debug_item(debug_eval_outline, p_core_2e_w8, 0));
	items.add(path + "core w1", debug_item(debug_eval_outline, p_core_2e_w1, 0));
	items.add(path + "core src", debug_item(debug_eval_outline, p_core_2e_src, 0));
	items.add(path + "core x", debug_item(debug_eval_outline, p_core_2e_x, 0));
	items.add(path + "core sd_v1", debug_item(p_core_2e_sd__v1, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core sd_v2", debug_item(p_core_2e_sd__v2, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core y", debug_item(debug_eval_outline, p_core_2e_y, 0));
	items.add(path + "core x_fb", debug_item(debug_eval_outline, p_core_2e_x__fb, 0));
	items.add(path + "core s1", debug_item(debug_eval_outline, p_core_2e_s1, 0));
	items.add(path + "core lo", debug_item(debug_eval_outline, p_core_2e_lo, 0));
	items.add(path + "core hi", debug_item(debug_eval_outline, p_core_2e_hi, 0));
	items.add(path + "core v1_n", debug_item(debug_eval_outline, p_core_2e_v1__n, 0));
	items.add(path + "core v2_n", debug_item(debug_eval_outline, p_core_2e_v2__n, 0));
	items.add(path + "core sd_restart", debug_item(debug_eval_outline, p_core_2e_sd__restart, 0));
	items.add(path + "spi clk", debug_item(debug_alias(), p_clk, 0));
	items.add(path + "spi rst_n", debug_item(debug_alias(), p_rst__n, 0));
	items.add(path + "spi cs_n_pin", debug_item(debug_eval_outline, p_spi_2e_cs__n__pin, 0));
	items.add(path + "spi sck_pin", debug_item(debug_eval_outline, p_spi_2e_sck__pin, 0));
	items.add(path + "spi mosi_pin", debug_item(debug_eval_outline, p_spi_2e_mosi__pin, 0));
	items.add(path + "spi miso", debug_item(debug_eval_outline, p_spi_2e_miso, 0));
	items.add(path + "spi hit_cmd", debug_item(debug_eval_outline, p_spi_2e_hit__cmd, 0));
	items.add(path + "spi stop", debug_item(debug_eval_outline, p_spi_2e_stop, 0));
	items.add(path + "spi ch", debug_item(p_spi_2e_ch, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi byte_done", debug_item(debug_eval_outline, p_spi_2e_byte__done, 0));
	items.add(path + "spi idx", debug_item(debug_alias(), p_spi_2e_bytecnt, 0));
	items.add(path + "spi rx", debug_item(p_spi_2e_rx, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi cs_s", debug_item(p_spi_2e_cs__s, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi sck_s", debug_item(p_spi_2e_sck__s, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi mosi_s", debug_item(p_spi_2e_mosi__s, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi bitcnt", debug_item(p_spi_2e_bitcnt, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi bytecnt", debug_item(p_spi_2e_bytecnt, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi is_hit", debug_item(p_spi_2e_is__hit, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi active", debug_item(debug_eval_outline, p_spi_2e_active, 0));
	items.add(path + "spi rise", debug_item(debug_eval_outline, p_spi_2e_rise, 0));
	items.add(path + "spi last_bit", debug_item(debug_eval_outline, p_spi_2e_last__bit, 0));
	items.add(path + "spi byte_in", debug_item(debug_eval_outline, p_spi_2e_byte__in, 0));
	items.add(path + "spi cmd_end", debug_item(debug_eval_outline, p_spi_2e_cmd__end, 0));
	static const value<1> const_p___unused = value<1>{0u};
	items.add(path + "_unused", debug_item(const_p___unused, 0));
	items.add(path + "digit", debug_item(debug_eval_outline, p_digit, 0));
	items.add(path + "hold", debug_item(debug_alias(), p_spi_2e_rx, 0));
	items.add(path + "byte_idx", debug_item(debug_alias(), p_spi_2e_bytecnt, 0));
	items.add(path + "hit_ch", debug_item(debug_alias(), p_spi_2e_ch, 0));
	items.add(path + "frame_sync", debug_item(debug_eval_outline, p_core_2e_frame__sync, 0));
	items.add(path + "busy", debug_item(debug_eval_outline, p_core_2e_busy, 0));
	items.add(path + "audio", debug_item(debug_eval_outline, p_core_2e_y, 0));
	items.add(path + "byte_done", debug_item(debug_eval_outline, p_spi_2e_byte__done, 0));
	items.add(path + "stop", debug_item(debug_eval_outline, p_spi_2e_stop, 0));
	items.add(path + "hit_cmd", debug_item(debug_eval_outline, p_spi_2e_hit__cmd, 0));
	items.add(path + "miso", debug_item(debug_eval_outline, p_spi_2e_miso, 0));
	items.add(path + "rst_n", debug_item(p_rst__n, 0, debug_item::INPUT|debug_item::UNDRIVEN));
	items.add(path + "clk", debug_item(p_clk, 0, debug_item::INPUT|debug_item::UNDRIVEN));
	items.add(path + "ena", debug_item(p_ena, 0, debug_item::INPUT|debug_item::UNDRIVEN));
	static const value<8> const_p_uio__oe = value<8>{0xf4u};
	items.add(path + "uio_oe", debug_item(const_p_uio__oe, 0));
	items.add(path + "uio_out", debug_item(p_uio__out, 0, debug_item::OUTPUT|debug_item::DRIVEN_COMB));
	items.add(path + "uio_in", debug_item(p_uio__in, 0, debug_item::INPUT|debug_item::UNDRIVEN));
	items.add(path + "uo_out", debug_item(p_uo__out, 0, debug_item::OUTPUT|debug_item::DRIVEN_COMB));
	items.add(path + "ui_in", debug_item(p_ui__in, 0, debug_item::INPUT|debug_item::UNDRIVEN));
}

} // namespace cxxrtl_design

extern "C"
cxxrtl_toplevel cxxrtl_design_create() {
	return new _cxxrtl_toplevel { std::unique_ptr<cxxrtl_design::p_tt__um__ai__wrangler__uds3>(new cxxrtl_design::p_tt__um__ai__wrangler__uds3) };
}

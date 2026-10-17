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
// \src: chip/src/project.v:16.1-107.10
struct p_tt__um__ai__wrangler__uds1x1 : public module {
	// \hdlname: core status
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:46.24-46.30
	wire<8> p_core_2e_status;
	// \hdlname: core audio
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:47.24-47.29
	wire<1> p_core_2e_audio;
	// \hdlname: core t
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:57.17-57.18
	wire<6> p_core_2e_t;
	// \hdlname: core v
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:58.17-58.18
	wire<1> p_core_2e_v;
	// \hdlname: core frame
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:59.17-59.22
	wire<13> p_core_2e_frame;
	// \hdlname: core clearing
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:60.17-60.25
	wire<1> p_core_2e_clearing;
	// \hdlname: core ring
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:81.17-81.21
	wire<96> p_core_2e_ring;
	// \hdlname: core c_tri
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:114.13-114.18
	wire<9> p_core_2e_c__tri;
	// \hdlname: core c_env
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:115.13-115.18
	wire<8> p_core_2e_c__env;
	// \hdlname: core c_bal
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:116.13-116.18
	wire<4> p_core_2e_c__bal;
	// \hdlname: core c_metal
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:117.13-117.20
	wire<1> p_core_2e_c__metal;
	// \hdlname: core c_pe
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:118.13-118.17
	wire<8> p_core_2e_c__pe;
	// \hdlname: core c_dec
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:119.13-119.18
	wire<1> p_core_2e_c__dec;
	// \hdlname: core bor
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:143.14-143.17
	wire<1> p_core_2e_bor;
	// \hdlname: core cy
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:150.14-150.16
	wire<1> p_core_2e_cy;
	// \hdlname: core pend
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:163.16-163.20
	wire<1> p_core_2e_pend;
	// \hdlname: core commit
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:164.16-164.22
	wire<1> p_core_2e_commit;
	// \hdlname: core tgt
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:165.17-165.20
	wire<1> p_core_2e_tgt;
	// \hdlname: core kill
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:166.16-166.20
	wire<1> p_core_2e_kill;
	// \hdlname: core kill_pend
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:166.22-166.31
	wire<1> p_core_2e_kill__pend;
	// \hdlname: core trig_s
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:238.14-238.20
	wire<8> p_core_2e_trig__s;
	// \hdlname: core served
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:238.22-238.28
	wire<8> p_core_2e_served;
	// \hdlname: core lfsr
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:291.14-291.18
	wire<17> p_core_2e_lfsr;
	// \hdlname: core m3
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:292.14-292.16
	wire<2> p_core_2e_m3;
	// \hdlname: core m5
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:293.14-293.16
	wire<3> p_core_2e_m5;
	// \hdlname: core m7
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:293.18-293.20
	wire<3> p_core_2e_m7;
	// \hdlname: core sq3
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:294.14-294.17
	wire<1> p_core_2e_sq3;
	// \hdlname: core sq5
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:294.19-294.22
	wire<1> p_core_2e_sq5;
	// \hdlname: core sq7
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:294.24-294.27
	wire<1> p_core_2e_sq7;
	// \hdlname: core acc
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:314.15-314.18
	wire<12> p_core_2e_acc;
	// \hdlname: spi ch
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:32.24-32.26
	wire<3> p_spi_2e_ch;
	// \hdlname: spi cs_s
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:42.13-42.17
	wire<2> p_spi_2e_cs__s;
	// \hdlname: spi sck_s
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:43.13-43.18
	wire<3> p_spi_2e_sck__s;
	// \hdlname: spi mosi_s
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:44.13-44.19
	wire<1> p_spi_2e_mosi__s;
	// \hdlname: spi bitcnt
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:45.13-45.19
	wire<3> p_spi_2e_bitcnt;
	// \hdlname: spi bytecnt
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:46.13-46.20
	wire<2> p_spi_2e_bytecnt;
	// \hdlname: spi is_hit
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:47.13-47.19
	wire<1> p_spi_2e_is__hit;
	// \hdlname: spi sr
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:48.14-48.16
	wire<24> p_spi_2e_sr;
	// \src: chip/src/project.v:24.23-24.28
	/*input*/ value<1> p_rst__n;
	// \src: chip/src/project.v:23.23-23.26
	/*input*/ value<1> p_clk;
	value<1> prev_p_clk;
	bool posedge_p_clk() const {
		return !prev_p_clk.slice<0>().val() && p_clk.slice<0>().val();
	}
	// \src: chip/src/project.v:22.23-22.26
	/*input*/ value<1> p_ena;
	// \src: chip/src/project.v:21.23-21.29
	/*output*/ value<8> p_uio__oe;
	// \src: chip/src/project.v:20.23-20.30
	/*output*/ value<8> p_uio__out;
	// \src: chip/src/project.v:19.23-19.29
	/*input*/ value<8> p_uio__in;
	// \src: chip/src/project.v:18.23-18.29
	/*output*/ value<8> p_uo__out;
	// \src: chip/src/project.v:17.23-17.28
	/*input*/ value<8> p_ui__in;
	// \hdlname: core commit_shift
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:40.24-40.36
	/*outline*/ value<1> p_core_2e_commit__shift;
	// \hdlname: core preset_ch
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:42.24-42.33
	/*outline*/ value<3> p_core_2e_preset__ch;
	// \hdlname: core preset
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:43.24-43.30
	/*outline*/ value<24> p_core_2e_preset;
	// \hdlname: core busy
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:48.24-48.28
	/*outline*/ value<1> p_core_2e_busy;
	// \hdlname: core frame_sync
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:49.24-49.34
	/*outline*/ value<1> p_core_2e_frame__sync;
	// \hdlname: core wend
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:61.17-61.21
	/*outline*/ value<1> p_core_2e_wend;
	// \hdlname: core fend
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:62.17-62.21
	/*outline*/ value<1> p_core_2e_fend;
	// \hdlname: core tail
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:82.17-82.21
	/*outline*/ value<1> p_core_2e_tail;
	// \hdlname: core head
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:83.17-83.21
	/*outline*/ value<1> p_core_2e_head;
	// \hdlname: core nw
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:88.16-88.18
	/*outline*/ value<48> p_core_2e_nw;
	// \hdlname: core n_pitch
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:96.14-96.21
	/*outline*/ value<8> p_core_2e_n__pitch;
	// \hdlname: core n_sweep
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:97.14-97.21
	/*outline*/ value<4> p_core_2e_n__sweep;
	// \hdlname: core n_bal
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:98.14-98.19
	/*outline*/ value<4> p_core_2e_n__bal;
	// \hdlname: core n_env
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:99.14-99.19
	/*outline*/ value<8> p_core_2e_n__env;
	// \hdlname: core n_ph
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:100.14-100.18
	/*outline*/ value<10> p_core_2e_n__ph;
	// \hdlname: core n_ch
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:101.14-101.18
	/*outline*/ value<3> p_core_2e_n__ch;
	// \hdlname: core up
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:104.14-104.16
	/*outline*/ value<7> p_core_2e_up;
	// \hdlname: core off
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:105.14-105.17
	/*outline*/ value<7> p_core_2e_off;
	// \hdlname: core pe_raw
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:106.14-106.20
	/*outline*/ value<9> p_core_2e_pe__raw;
	// \hdlname: core n_pe
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:107.14-107.18
	/*outline*/ value<8> p_core_2e_n__pe;
	// \hdlname: core fold
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:110.14-110.18
	/*outline*/ value<9> p_core_2e_fold;
	// \hdlname: core n_tri
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:111.14-111.19
	/*outline*/ value<9> p_core_2e_n__tri;
	// \hdlname: core c0_decay
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:122.15-122.23
	/*outline*/ value<4> p_core_2e_c0__decay;
	// \hdlname: core dmask
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:123.15-123.20
	/*outline*/ value<13> p_core_2e_dmask;
	// \hdlname: core in_env
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:137.14-137.20
	/*outline*/ value<1> p_core_2e_in__env;
	// \hdlname: core in_phase
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:138.14-138.22
	/*outline*/ value<1> p_core_2e_in__phase;
	// \hdlname: core ej
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:139.14-139.16
	/*outline*/ value<3> p_core_2e_ej;
	// \hdlname: core pj
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:140.14-140.16
	/*outline*/ value<4> p_core_2e_pj;
	// \hdlname: core env_lt8
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:144.14-144.21
	/*outline*/ value<1> p_core_2e_env__lt8;
	// \hdlname: core d_bit
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:145.14-145.19
	/*outline*/ value<1> p_core_2e_d__bit;
	// \hdlname: core bor_in
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:146.14-146.20
	/*outline*/ value<1> p_core_2e_bor__in;
	// \hdlname: core env_new
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:147.14-147.21
	/*outline*/ value<1> p_core_2e_env__new;
	// \hdlname: core pk
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:151.14-151.16
	/*outline*/ value<5> p_core_2e_pk;
	// \hdlname: core mant
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:152.14-152.18
	/*outline*/ value<6> p_core_2e_mant;
	// \hdlname: core inc_bit
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:153.14-153.21
	/*outline*/ value<1> p_core_2e_inc__bit;
	// \hdlname: core cy_in
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:154.14-154.19
	/*outline*/ value<1> p_core_2e_cy__in;
	// \hdlname: core ph_new
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:155.14-155.20
	/*outline*/ value<1> p_core_2e_ph__new;
	// \hdlname: core choice
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:167.17-167.23
	/*outline*/ value<1> p_core_2e_choice;
	// \hdlname: core committing
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:168.16-168.26
	/*outline*/ value<1> p_core_2e_committing;
	// \hdlname: core tail_commit
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:169.16-169.27
	/*outline*/ value<1> p_core_2e_tail__commit;
	// \hdlname: core act
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:195.18-195.21
	/*outline*/ value<2> p_core_2e_act;
	// \hdlname: core same
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:195.23-195.27
	/*outline*/ value<2> p_core_2e_same;
	// \hdlname: core envhi
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:196.18-196.23
	/*outline*/ value<6> p_core_2e_envhi;
	// \hdlname: core chbits
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:197.18-197.24
	/*outline*/ value<16> p_core_2e_chbits;
	// \hdlname: core hgrp
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:198.18-198.22
	/*outline*/ value<3> p_core_2e_hgrp;
	// \hdlname: core best
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:218.13-218.17
	/*outline*/ value<3> p_core_2e_best;
	// \hdlname: core status_next
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:219.13-219.24
	/*outline*/ value<8> p_core_2e_status__next;
	// \hdlname: core waiting
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:239.14-239.21
	/*outline*/ value<8> p_core_2e_waiting;
	// \hdlname: core first
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:240.14-240.19
	/*outline*/ value<8> p_core_2e_first;
	// \hdlname: core pc
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:309.14-309.16
	/*outline*/ value<3> p_core_2e_pc;
	// \hdlname: core drum
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:310.14-310.18
	/*outline*/ value<9> p_core_2e_drum;
	// \hdlname: core metal
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:311.14-311.19
	/*outline*/ value<9> p_core_2e_metal;
	// \hdlname: core q
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:315.15-315.16
	/*outline*/ value<5> p_core_2e_q;
	// \hdlname: core qr
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:316.15-316.17
	/*outline*/ value<6> p_core_2e_qr;
	// \hdlname: core w8
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:317.15-317.17
	/*outline*/ value<1> p_core_2e_w8;
	// \hdlname: core w1
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:318.15-318.17
	/*outline*/ value<1> p_core_2e_w1;
	// \hdlname: core sel_n
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:319.15-319.20
	/*outline*/ value<1> p_core_2e_sel__n;
	// \hdlname: core src
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:320.15-320.18
	/*outline*/ value<9> p_core_2e_src;
	// \hdlname: core x
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:321.15-321.16
	/*outline*/ value<12> p_core_2e_x;
	// \hdlname: core sum
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:324.15-324.18
	/*outline*/ value<13> p_core_2e_sum;
	// \hdlname: core g_slot[0].e
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:202.18-202.19
	/*outline*/ value<8> p_core_2e_g__slot_5b_0_5d__2e_e;
	// \hdlname: core g_slot[0].c
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:203.18-203.19
	/*outline*/ value<3> p_core_2e_g__slot_5b_0_5d__2e_c;
	// \hdlname: core g_slot[1].e
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:202.18-202.19
	/*outline*/ value<8> p_core_2e_g__slot_5b_1_5d__2e_e;
	// \hdlname: core g_slot[1].c
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:203.18-203.19
	/*outline*/ value<3> p_core_2e_g__slot_5b_1_5d__2e_c;
	// \hdlname: spi cs_n_pin
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:23.24-23.32
	/*outline*/ value<1> p_spi_2e_cs__n__pin;
	// \hdlname: spi sck_pin
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:24.24-24.31
	/*outline*/ value<1> p_spi_2e_sck__pin;
	// \hdlname: spi mosi_pin
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:25.24-25.32
	/*outline*/ value<1> p_spi_2e_mosi__pin;
	// \hdlname: spi miso
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:26.24-26.28
	/*outline*/ value<1> p_spi_2e_miso;
	// \hdlname: spi idle
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:27.24-27.28
	/*outline*/ value<1> p_spi_2e_idle;
	// \hdlname: spi hit_done
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:30.24-30.32
	/*outline*/ value<1> p_spi_2e_hit__done;
	// \hdlname: spi stop
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:31.24-31.28
	/*outline*/ value<1> p_spi_2e_stop;
	// \hdlname: spi payload_msb
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:33.24-33.35
	/*outline*/ value<1> p_spi_2e_payload__msb;
	// \hdlname: spi level
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:34.24-34.29
	/*outline*/ value<4> p_spi_2e_level;
	// \hdlname: spi active
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:50.14-50.20
	/*outline*/ value<1> p_spi_2e_active;
	// \hdlname: spi rise
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:51.14-51.18
	/*outline*/ value<1> p_spi_2e_rise;
	// \hdlname: spi byte_in
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:52.14-52.21
	/*outline*/ value<8> p_spi_2e_byte__in;
	// \hdlname: spi cmd_end
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:53.14-53.21
	/*outline*/ value<1> p_spi_2e_cmd__end;
	// \hdlname: spi read_cmd
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:54.14-54.22
	/*outline*/ value<1> p_spi_2e_read__cmd;
	// \hdlname: spi read_value
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:56.14-56.24
	/*outline*/ value<8> p_spi_2e_read__value;
	// \src: chip/src/project.v:87.13-87.18
	/*outline*/ value<7> p_digit;
	p_tt__um__ai__wrangler__uds1x1(interior) {}
	p_tt__um__ai__wrangler__uds1x1() {
		reset();
	};

	void reset() override;
	bool eval() override;
	bool commit() override;

	void debug_eval();
	debug_outline debug_eval_outline { std::bind(&p_tt__um__ai__wrangler__uds1x1::debug_eval, this) };

	void debug_info(debug_items &items, std::string path = "") override;
}; // struct p_tt__um__ai__wrangler__uds1x1

void p_tt__um__ai__wrangler__uds1x1::reset() {
}

bool p_tt__um__ai__wrangler__uds1x1::eval() {
	bool converged = true;
	bool posedge_p_clk = this->posedge_p_clk();
	value<2> i_procmux_24_459__CMP;
	// \hdlname: core clk
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:31.24-31.27
	value<1> p_core_2e_clk;
	// \hdlname: core hit_ch
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:36.24-36.30
	value<3> p_core_2e_hit__ch;
	// \hdlname: core wend
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:61.17-61.21
	value<1> p_core_2e_wend;
	// \hdlname: core fend
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:62.17-62.21
	value<1> p_core_2e_fend;
	// \hdlname: core head
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:83.17-83.21
	value<1> p_core_2e_head;
	// \hdlname: core nw
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:88.16-88.18
	value<48> p_core_2e_nw;
	// \hdlname: core n_env
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:99.14-99.19
	value<8> p_core_2e_n__env;
	// \hdlname: core n_ph
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:100.14-100.18
	value<10> p_core_2e_n__ph;
	// \hdlname: core n_ch
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:101.14-101.18
	value<3> p_core_2e_n__ch;
	// \hdlname: core pe_raw
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:106.14-106.20
	value<9> p_core_2e_pe__raw;
	// \hdlname: core in_env
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:137.14-137.20
	value<1> p_core_2e_in__env;
	// \hdlname: core ej
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:139.14-139.16
	value<3> p_core_2e_ej;
	// \hdlname: core pj
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:140.14-140.16
	value<4> p_core_2e_pj;
	// \hdlname: core d_bit
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:145.14-145.19
	value<1> p_core_2e_d__bit;
	// \hdlname: core bor_in
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:146.14-146.20
	value<1> p_core_2e_bor__in;
	// \hdlname: core pk
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:151.14-151.16
	value<5> p_core_2e_pk;
	// \hdlname: core inc_bit
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:153.14-153.21
	value<1> p_core_2e_inc__bit;
	// \hdlname: core cy_in
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:154.14-154.19
	value<1> p_core_2e_cy__in;
	// \hdlname: core committing
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:168.16-168.26
	value<1> p_core_2e_committing;
	// \hdlname: core act
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:195.18-195.21
	value<2> p_core_2e_act;
	// \hdlname: core same
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:195.23-195.27
	value<2> p_core_2e_same;
	// \hdlname: core envhi
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:196.18-196.23
	value<6> p_core_2e_envhi;
	// \hdlname: core hgrp
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:198.18-198.22
	value<3> p_core_2e_hgrp;
	// \hdlname: core pc
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:309.14-309.16
	value<3> p_core_2e_pc;
	// \hdlname: core q
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:315.15-315.16
	value<5> p_core_2e_q;
	// \hdlname: core w8
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:317.15-317.17
	value<1> p_core_2e_w8;
	// \hdlname: core src
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:320.15-320.18
	value<9> p_core_2e_src;
	// \hdlname: core x
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:321.15-321.16
	value<12> p_core_2e_x;
	// \hdlname: core g_slot[0].e
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:202.18-202.19
	value<8> p_core_2e_g__slot_5b_0_5d__2e_e;
	// \hdlname: core g_slot[0].c
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:203.18-203.19
	value<3> p_core_2e_g__slot_5b_0_5d__2e_c;
	// \hdlname: core g_slot[1].e
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:202.18-202.19
	value<8> p_core_2e_g__slot_5b_1_5d__2e_e;
	// \hdlname: core g_slot[1].c
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:203.18-203.19
	value<3> p_core_2e_g__slot_5b_1_5d__2e_c;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:110.23-110.47
	value<9> i_flatten_5c_core_2e__24_xor_24_chip_2f_src_2f_uds__core_2e_v_3a_110_24_243__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:303.11-303.21
	value<1> i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_303_24_344__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:304.11-304.21
	value<1> i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_304_24_347__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:305.11-305.21
	value<1> i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_305_24_350__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:324.23-324.60
	value<13> i_flatten_5c_core_2e__24_add_24_chip_2f_src_2f_uds__core_2e_v_3a_324_24_374__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:210.35-210.37
	value<1> i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_377__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:210.35-210.37
	value<1> i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_384__Y;
	// \hdlname: spi clk
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:21.24-21.27
	value<1> p_spi_2e_clk;
	// \hdlname: spi commit_shift
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:36.24-36.36
	value<1> p_spi_2e_commit__shift;
	// \hdlname: spi active
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:50.14-50.20
	value<1> p_spi_2e_active;
	// \hdlname: spi rise
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:51.14-51.18
	value<1> p_spi_2e_rise;
	// \hdlname: spi byte_in
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:52.14-52.21
	value<8> p_spi_2e_byte__in;
	// \hdlname: spi cmd_end
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:53.14-53.21
	value<1> p_spi_2e_cmd__end;
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:84.11-84.18
	value<1> i_flatten_5c_spi_2e__24_logic__not_24_chip_2f_src_2f_uds__spi_2e_v_3a_84_24_411__Y;
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:90.13-90.27
	value<1> i_flatten_5c_spi_2e__24_eq_24_chip_2f_src_2f_uds__spi_2e_v_3a_90_24_413__Y;
	// \src: chip/src/project.v:38.15-38.20
	value<1> p_audio;
	// \src: chip/src/project.v:34.15-34.21
	value<3> p_hit__ch;
	// connection
	p_core_2e_pj = p_core_2e_t.curr.slice<3,0>().val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:151.24-151.55
	// cell $flatten\core.$sub$chip/src/uds_core.v:151$267
	p_core_2e_pk = sub_uu<5>(value<1>{0u}.concat(p_core_2e_pj).val(), value<2>{0u}.concat(p_core_2e_c__pe.curr.slice<7,5>()).val());
	// connection
	p_core_2e_ej = p_core_2e_t.curr.slice<2,0>().val();
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:153$272 $flatten\core.$shiftx$chip/src/uds_core.v:0$271 $flatten\core.$logic_and$chip/src/uds_core.v:153$270 $flatten\core.$le$chip/src/uds_core.v:153$269 $flatten\core.$logic_not$chip/src/uds_core.v:153$268
	p_core_2e_inc__bit = logic_and<1>(logic_and<1>(logic_not<1>(p_core_2e_pk.slice<4>().val()), le_uu<1>(p_core_2e_pk.slice<3,0>().val(), value<4>{0x5u})), shiftx_uu<1>(value<1>{0x1u}.concat(p_core_2e_c__pe.curr.slice<4,0>()).val(), p_core_2e_pk.slice<2,0>().val()));
	// connection
	p_core_2e_head = p_core_2e_ring.curr.slice<95>().val();
	// cells $flatten\core.$ternary$chip/src/uds_core.v:154$274 $flatten\core.$eq$chip/src/uds_core.v:154$273
	p_core_2e_cy__in = (logic_not<1>(p_core_2e_pj) ? value<1>{0u} : p_core_2e_cy.curr);
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<7>() = p_core_2e_ring.curr.slice<23>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<6>() = p_core_2e_ring.curr.slice<24>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<5>() = p_core_2e_ring.curr.slice<25>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<4>() = p_core_2e_ring.curr.slice<26>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<3>() = p_core_2e_ring.curr.slice<27>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<2>() = p_core_2e_ring.curr.slice<28>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<1>() = p_core_2e_ring.curr.slice<29>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<0>() = p_core_2e_ring.curr.slice<30>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<7>() = p_core_2e_ring.curr.slice<71>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<6>() = p_core_2e_ring.curr.slice<72>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<5>() = p_core_2e_ring.curr.slice<73>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<4>() = p_core_2e_ring.curr.slice<74>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<3>() = p_core_2e_ring.curr.slice<75>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<2>() = p_core_2e_ring.curr.slice<76>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<1>() = p_core_2e_ring.curr.slice<77>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<0>() = p_core_2e_ring.curr.slice<78>().val();
	// cells $flatten\core.$ternary$chip/src/uds_core.v:145$262 $flatten\core.$eq$chip/src/uds_core.v:144$258 $flatten\core.$eq$chip/src/uds_core.v:145$259 $flatten\core.$and$chip/src/uds_core.v:145$261 $flatten\core.$le$chip/src/uds_core.v:145$260
	p_core_2e_d__bit = (logic_not<1>(p_core_2e_c__env.curr.slice<7,3>().val()) ? logic_not<1>(p_core_2e_ej) : and_uu<1>(p_core_2e_ring.curr.slice<92>().val(), le_uu<1>(p_core_2e_ej, value<3>{0x4u})));
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:137.25-137.41
	// cell $flatten\core.$eq$chip/src/uds_core.v:137$256
	p_core_2e_in__env = eq_uu<1>(p_core_2e_t.curr.slice<5,3>().val(), value<3>{0x2u});
	// cells $flatten\core.$add$chip/src/uds_core.v:309$355 $flatten\core.$add$chip/src/uds_core.v:309$354 $flatten\core.$add$chip/src/uds_core.v:309$353
	p_core_2e_pc = add_uu<3>(add_uu<3>(add_uu<3>(value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<0>()).val(), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<1>()).val()), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<2>()).val()), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<3>()).val());
	// connection
	p_core_2e_envhi.slice<5,3>() = p_core_2e_g__slot_5b_1_5d__2e_e.slice<7,5>().val();
	// connection
	p_core_2e_envhi.slice<2,0>() = p_core_2e_g__slot_5b_0_5d__2e_e.slice<7,5>().val();
	// connection
	p_hit__ch = p_spi_2e_ch.curr;
	// cells $flatten\core.$ternary$chip/src/uds_core.v:146$264 $flatten\core.$eq$chip/src/uds_core.v:146$263
	p_core_2e_bor__in = (logic_not<1>(p_core_2e_ej) ? value<1>{0u} : p_core_2e_bor.curr);
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:168$289 $flatten\core.$eq$chip/src/uds_core.v:168$288
	p_core_2e_committing = logic_and<1>(p_core_2e_commit.curr, eq_uu<1>(p_core_2e_v.curr, p_core_2e_tgt.curr));
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:50.25-50.33
	// cell $flatten\spi.$logic_not$chip/src/uds_spi.v:50$391
	p_spi_2e_active = logic_not<1>(p_spi_2e_cs__s.curr.slice<1>().val());
	// connection
	p_core_2e_q = p_core_2e_c__env.curr.slice<7,3>().val();
	// connection
	p_core_2e_hit__ch = p_hit__ch;
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_c.slice<2>() = p_core_2e_ring.curr.slice<16>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_c.slice<1>() = p_core_2e_ring.curr.slice<17>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_c.slice<0>() = p_core_2e_ring.curr.slice<18>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_c.slice<2>() = p_core_2e_ring.curr.slice<64>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_c.slice<1>() = p_core_2e_ring.curr.slice<65>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_c.slice<0>() = p_core_2e_ring.curr.slice<66>().val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:317.23-317.36
	// cell $flatten\core.$lt$chip/src/uds_core.v:317$363
	p_core_2e_w8 = lt_uu<1>(p_core_2e_t.curr, value<1>{0u}.concat(p_core_2e_q).val());
	// cells $flatten\spi.$logic_and$chip/src/uds_spi.v:51$394 $flatten\spi.$logic_not$chip/src/uds_spi.v:51$393 $flatten\spi.$logic_and$chip/src/uds_spi.v:51$392
	p_spi_2e_rise = logic_and<1>(logic_and<1>(p_spi_2e_active, p_spi_2e_sck__s.curr.slice<1>().val()), logic_not<1>(p_spi_2e_sck__s.curr.slice<2>().val()));
	// connection
	p_core_2e_nw.slice<47>() = p_core_2e_ring.curr.slice<47>().val();
	// connection
	p_core_2e_nw.slice<46>() = p_core_2e_ring.curr.slice<48>().val();
	// connection
	p_core_2e_nw.slice<45>() = p_core_2e_ring.curr.slice<49>().val();
	// connection
	p_core_2e_nw.slice<44>() = p_core_2e_ring.curr.slice<50>().val();
	// connection
	p_core_2e_nw.slice<43>() = p_core_2e_ring.curr.slice<51>().val();
	// connection
	p_core_2e_nw.slice<42>() = p_core_2e_ring.curr.slice<52>().val();
	// connection
	p_core_2e_nw.slice<41>() = p_core_2e_ring.curr.slice<53>().val();
	// connection
	p_core_2e_nw.slice<40>() = p_core_2e_ring.curr.slice<54>().val();
	// connection
	p_core_2e_nw.slice<39>() = p_core_2e_ring.curr.slice<55>().val();
	// connection
	p_core_2e_nw.slice<38>() = p_core_2e_ring.curr.slice<56>().val();
	// connection
	p_core_2e_nw.slice<37>() = p_core_2e_ring.curr.slice<57>().val();
	// connection
	p_core_2e_nw.slice<36>() = p_core_2e_ring.curr.slice<58>().val();
	// connection
	p_core_2e_nw.slice<35>() = p_core_2e_ring.curr.slice<59>().val();
	// connection
	p_core_2e_nw.slice<34>() = p_core_2e_ring.curr.slice<60>().val();
	// connection
	p_core_2e_nw.slice<33>() = p_core_2e_ring.curr.slice<61>().val();
	// connection
	p_core_2e_nw.slice<32>() = p_core_2e_ring.curr.slice<62>().val();
	// connection
	p_core_2e_nw.slice<31>() = p_core_2e_ring.curr.slice<63>().val();
	// connection
	p_core_2e_nw.slice<30>() = p_core_2e_ring.curr.slice<64>().val();
	// connection
	p_core_2e_nw.slice<29>() = p_core_2e_ring.curr.slice<65>().val();
	// connection
	p_core_2e_nw.slice<28>() = p_core_2e_ring.curr.slice<66>().val();
	// connection
	p_core_2e_nw.slice<27>() = p_core_2e_ring.curr.slice<67>().val();
	// connection
	p_core_2e_nw.slice<26>() = p_core_2e_ring.curr.slice<68>().val();
	// connection
	p_core_2e_nw.slice<25>() = p_core_2e_ring.curr.slice<69>().val();
	// connection
	p_core_2e_nw.slice<24>() = p_core_2e_ring.curr.slice<70>().val();
	// connection
	p_core_2e_nw.slice<23>() = p_core_2e_ring.curr.slice<71>().val();
	// connection
	p_core_2e_nw.slice<22>() = p_core_2e_ring.curr.slice<72>().val();
	// connection
	p_core_2e_nw.slice<21>() = p_core_2e_ring.curr.slice<73>().val();
	// connection
	p_core_2e_nw.slice<20>() = p_core_2e_ring.curr.slice<74>().val();
	// connection
	p_core_2e_nw.slice<19>() = p_core_2e_ring.curr.slice<75>().val();
	// connection
	p_core_2e_nw.slice<18>() = p_core_2e_ring.curr.slice<76>().val();
	// connection
	p_core_2e_nw.slice<17>() = p_core_2e_ring.curr.slice<77>().val();
	// connection
	p_core_2e_nw.slice<16>() = p_core_2e_ring.curr.slice<78>().val();
	// connection
	p_core_2e_nw.slice<15>() = p_core_2e_ring.curr.slice<79>().val();
	// connection
	p_core_2e_nw.slice<14>() = p_core_2e_ring.curr.slice<80>().val();
	// connection
	p_core_2e_nw.slice<13>() = p_core_2e_ring.curr.slice<81>().val();
	// connection
	p_core_2e_nw.slice<12>() = p_core_2e_ring.curr.slice<82>().val();
	// connection
	p_core_2e_nw.slice<11>() = p_core_2e_ring.curr.slice<83>().val();
	// connection
	p_core_2e_nw.slice<10>() = p_core_2e_ring.curr.slice<84>().val();
	// connection
	p_core_2e_nw.slice<9>() = p_core_2e_ring.curr.slice<85>().val();
	// connection
	p_core_2e_nw.slice<8>() = p_core_2e_ring.curr.slice<86>().val();
	// connection
	p_core_2e_nw.slice<7>() = p_core_2e_ring.curr.slice<87>().val();
	// connection
	p_core_2e_nw.slice<6>() = p_core_2e_ring.curr.slice<88>().val();
	// connection
	p_core_2e_nw.slice<5>() = p_core_2e_ring.curr.slice<89>().val();
	// connection
	p_core_2e_nw.slice<4>() = p_core_2e_ring.curr.slice<90>().val();
	// connection
	p_core_2e_nw.slice<3>() = p_core_2e_ring.curr.slice<91>().val();
	// connection
	p_core_2e_nw.slice<2>() = p_core_2e_ring.curr.slice<92>().val();
	// connection
	p_core_2e_nw.slice<1>() = p_core_2e_ring.curr.slice<93>().val();
	// connection
	p_core_2e_nw.slice<0>() = p_core_2e_ring.curr.slice<94>().val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:210.35-210.37
	// cell $flatten\core.$reduce_or$chip/src/uds_core.v:210$384
	i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_384__Y = reduce_or<1>(p_core_2e_g__slot_5b_1_5d__2e_e);
	// cells $flatten\core.$ternary$chip/src/uds_core.v:198$309 $flatten\core.$eq$chip/src/uds_core.v:198$308
	p_core_2e_hgrp = (eq_uu<1>(p_core_2e_hit__ch, value<3>{0x7u}) ? value<3>{0x6u} : p_core_2e_hit__ch);
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:210.35-210.37
	// cell $flatten\core.$reduce_or$chip/src/uds_core.v:210$377
	i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_377__Y = reduce_or<1>(p_core_2e_g__slot_5b_0_5d__2e_e);
	// connection
	p_spi_2e_byte__in = p_spi_2e_sr.curr.slice<6,0>().concat(p_spi_2e_mosi__s.curr).val();
	// connection
	p_core_2e_n__env = p_core_2e_nw.slice<23,16>().val();
	// connection
	p_core_2e_act.slice<1>() = i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_384__Y;
	// connection
	p_core_2e_act.slice<0>() = i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_377__Y;
	// \full_case: 1
	// \src: chip/src/uds_core.v:176.5-182.12
	// cell $procmux$459_CMP0
	i_procmux_24_459__CMP.slice<0>() = logic_not<1>(p_core_2e_t.curr.slice<5,3>().val());
	// \full_case: 1
	// \src: chip/src/uds_core.v:176.5-182.12
	// cell $procmux$459_CMP1
	i_procmux_24_459__CMP.slice<1>() = eq_uu<1>(p_core_2e_t.curr.slice<5,3>().val(), value<3>{0x1u});
	// cells $flatten\core.$ternary$chip/src/uds_core.v:320$369 $flatten\core.$lt$chip/src/uds_core.v:319$367 $flatten\core.$ternary$chip/src/uds_core.v:320$368 $flatten\core.$ternary$chip/src/uds_core.v:311$361 $flatten\core.$xor$chip/src/uds_core.v:311$360 $flatten\core.$xor$chip/src/uds_core.v:311$359 $flatten\core.$xor$chip/src/uds_core.v:311$358 $flatten\core.$ternary$chip/src/uds_core.v:310$357 $flatten\core.$not$chip/src/uds_core.v:310$356
	p_core_2e_src = (lt_uu<1>(p_core_2e_t.curr.slice<0>().concat(p_core_2e_t.curr.slice<1>()).concat(p_core_2e_t.curr.slice<2>()).concat(p_core_2e_t.curr.slice<3>()).val(), p_core_2e_c__bal.curr) ? (p_core_2e_c__metal.curr ? (xor_uu<1>(xor_uu<1>(xor_uu<1>(p_core_2e_sq3.curr, p_core_2e_sq5.curr), p_core_2e_sq7.curr), p_core_2e_frame.curr.slice<2>().val()) ? value<9>{0xffu} : value<9>{0x100u}) : (p_core_2e_pc.slice<2>().val() ? value<9>{0xffu} : not_u<1>(p_core_2e_pc.slice<1>().val()).concat(p_core_2e_pc.slice<0>()).concat(value<7>{0u}).val())) : p_core_2e_c__tri.curr);
	// cells $flatten\spi.$logic_and$chip/src/uds_spi.v:53$398 $flatten\spi.$eq$chip/src/uds_spi.v:53$397 $flatten\spi.$logic_and$chip/src/uds_spi.v:53$396 $flatten\spi.$eq$chip/src/uds_spi.v:53$395
	p_spi_2e_cmd__end = logic_and<1>(logic_and<1>(p_spi_2e_rise, eq_uu<1>(p_spi_2e_bitcnt.curr, value<3>{0x7u})), logic_not<1>(p_spi_2e_bytecnt.curr));
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:61.24-61.34
	// cell $flatten\core.$eq$chip/src/uds_core.v:61$226
	p_core_2e_wend = eq_uu<1>(p_core_2e_t.curr, value<6>{0x2fu});
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:211$388 $flatten\core.$eq$chip/src/uds_core.v:211$387 $flatten\core.$ternary$chip/src/uds_core.v:211$386 $flatten\core.$eq$chip/src/uds_core.v:211$385
	p_core_2e_same.slice<1>() = logic_and<1>(p_core_2e_act.slice<1>().val(), eq_uu<1>((eq_uu<1>(p_core_2e_g__slot_5b_1_5d__2e_c, value<3>{0x7u}) ? value<3>{0x6u} : p_core_2e_g__slot_5b_1_5d__2e_c), p_core_2e_hgrp));
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:211$381 $flatten\core.$eq$chip/src/uds_core.v:211$380 $flatten\core.$ternary$chip/src/uds_core.v:211$379 $flatten\core.$eq$chip/src/uds_core.v:211$378
	p_core_2e_same.slice<0>() = logic_and<1>(p_core_2e_act.slice<0>().val(), eq_uu<1>((eq_uu<1>(p_core_2e_g__slot_5b_0_5d__2e_c, value<3>{0x7u}) ? value<3>{0x6u} : p_core_2e_g__slot_5b_0_5d__2e_c), p_core_2e_hgrp));
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:90.13-90.27
	// cell $flatten\spi.$eq$chip/src/uds_spi.v:90$413
	i_flatten_5c_spi_2e__24_eq_24_chip_2f_src_2f_uds__spi_2e_v_3a_90_24_413__Y = eq_uu<1>(p_spi_2e_bitcnt.curr, value<3>{0x7u});
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:305.11-305.21
	// cell $flatten\core.$eq$chip/src/uds_core.v:305$350
	i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_305_24_350__Y = eq_uu<1>(p_core_2e_m7.curr, value<3>{0x6u});
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:304.11-304.21
	// cell $flatten\core.$eq$chip/src/uds_core.v:304$347
	i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_304_24_347__Y = eq_uu<1>(p_core_2e_m5.curr, value<3>{0x4u});
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:303.11-303.21
	// cell $flatten\core.$eq$chip/src/uds_core.v:303$344
	i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_303_24_344__Y = eq_uu<1>(p_core_2e_m3.curr, value<2>{0x2u});
	// connection
	p_core_2e_n__ph = p_core_2e_nw.slice<47,38>().val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:62.24-62.42
	// cell $flatten\core.$logic_and$chip/src/uds_core.v:62$228
	p_core_2e_fend = logic_and<1>(p_core_2e_wend, p_core_2e_v.curr);
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:171$293 $flatten\core.$logic_or$chip/src/uds_core.v:171$292 $flatten\core.$eq$chip/src/uds_core.v:171$291 $flatten\core.$eq$chip/src/uds_core.v:171$290
	p_spi_2e_commit__shift = logic_and<1>(p_core_2e_committing, logic_or<1>(logic_not<1>(p_core_2e_t.curr.slice<5,4>().val()), eq_uu<1>(p_core_2e_t.curr.slice<5,2>().val(), value<4>{0x6u})));
	// cells $flatten\core.$ternary$chip/src/uds_core.v:321$372 $flatten\core.$ternary$chip/src/uds_core.v:322$371 $flatten\core.$ternary$chip/src/uds_core.v:323$370 $flatten\core.$logic_and$chip/src/uds_core.v:318$366 $flatten\core.$lt$chip/src/uds_core.v:318$365 $flatten\core.$add$chip/src/uds_core.v:316$362 $flatten\core.$logic_not$chip/src/uds_core.v:318$364
	p_core_2e_x = (p_core_2e_clearing.curr ? value<12>{0u} : (p_core_2e_w8 ? p_core_2e_src.concat(value<3>{0u}).val() : (logic_and<1>(logic_not<1>(p_core_2e_w8), lt_uu<1>(p_core_2e_t.curr, add_uu<6>(value<1>{0u}.concat(p_core_2e_q).val(), value<3>{0u}.concat(p_core_2e_c__env.curr.slice<2,0>()).val()))) ? p_core_2e_src.slice<8>().val().repeat<3>().concat(p_core_2e_src).val() : value<12>{0u})));
	// connection
	i_flatten_5c_spi_2e__24_logic__not_24_chip_2f_src_2f_uds__spi_2e_v_3a_84_24_411__Y = p_spi_2e_cs__s.curr.slice<1>().val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:110.23-110.47
	// cell $flatten\core.$xor$chip/src/uds_core.v:110$243
	i_flatten_5c_core_2e__24_xor_24_chip_2f_src_2f_uds__core_2e_v_3a_110_24_243__Y = xor_uu<9>(p_core_2e_n__ph.slice<8,0>().val(), p_core_2e_n__ph.slice<9>().val().repeat<9>().val());
	// connection
	p_core_2e_n__ch = p_core_2e_nw.slice<30,28>().val();
	// cells $flatten\core.$add$chip/src/uds_core.v:106$241 $flatten\core.$shr$chip/src/uds_core.v:105$240 $flatten\core.$sub$chip/src/uds_core.v:105$239 $flatten\core.$ternary$chip/src/uds_core.v:104$238
	p_core_2e_pe__raw = add_uu<9>(value<1>{0u}.concat(p_core_2e_nw.slice<0>().concat(p_core_2e_nw.slice<1>()).concat(p_core_2e_nw.slice<2>()).concat(p_core_2e_nw.slice<3>()).concat(p_core_2e_nw.slice<4>()).concat(p_core_2e_nw.slice<5>()).concat(p_core_2e_nw.slice<6>()).concat(p_core_2e_nw.slice<7>())).val(), value<2>{0u}.concat(shr_uu<7>((p_core_2e_n__env.slice<7>().val() ? p_core_2e_n__env.slice<6,0>().val() : value<7>{0u}), sub_uu<3>(value<3>{0x7u}, p_core_2e_nw.slice<13>().concat(p_core_2e_nw.slice<14>()).concat(p_core_2e_nw.slice<15>()).val()))).val());
	// cells $flatten\core.$add$chip/src/uds_core.v:324$374 $flatten\core.$not$chip/src/uds_core.v:324$373
	i_flatten_5c_core_2e__24_add_24_chip_2f_src_2f_uds__core_2e_v_3a_324_24_374__Y = add_uu<13>(value<1>{0u}.concat(p_core_2e_acc.curr).val(), value<1>{0u}.concat(not_u<1>(p_core_2e_x.slice<11>().val())).concat(p_core_2e_x.slice<10,0>()).val());
	// connection
	p_spi_2e_clk = p_clk;
	// connection
	p_core_2e_clk = p_clk;
	// connection
	p_audio = p_core_2e_audio.curr;
	// cells $procdff$730 $procmux$679 $procmux$676 $procmux$674 $flatten\spi.$logic_and$chip/src/uds_spi.v:112$424 $flatten\spi.$eq$chip/src/uds_spi.v:54$399 $procmux$614 $procmux$615_CMP0 $procmux$616_CMP0 $procmux$617_CMP0 $procmux$669 $procmux$666
	if (posedge_p_clk) {
		p_spi_2e_sr.next = (p_spi_2e_commit__shift ? p_spi_2e_sr.curr.slice<22,7>().val() : (p_spi_2e_rise ? p_spi_2e_sr.curr.slice<22,7>().val() : p_spi_2e_sr.curr.slice<23,8>().val())).concat((p_spi_2e_commit__shift ? p_spi_2e_sr.curr.slice<6,0>().concat(value<1>{0u}).val() : (p_spi_2e_rise ? (logic_and<1>(p_spi_2e_cmd__end, eq_uu<1>(p_spi_2e_byte__in.slice<7,4>().val(), value<4>{0x3u})) ? (eq_uu<1>(p_spi_2e_byte__in.slice<1,0>().val(), value<2>{0x2u}) ? p_core_2e_status.curr : (eq_uu<1>(p_spi_2e_byte__in.slice<1,0>().val(), value<2>{0x1u}) ? value<8>{0x12u} : (logic_not<1>(p_spi_2e_byte__in.slice<1,0>().val()) ? value<8>{0xd5u} : value<8>{0u}))) : p_spi_2e_sr.curr.slice<6,0>().concat(p_spi_2e_mosi__s.curr).val()) : p_spi_2e_sr.curr.slice<7,0>().val()))).val();
	}
	// cells $procdff$723 $procmux$622
	if (posedge_p_clk) {
		p_spi_2e_cs__s.next = (p_rst__n ? p_spi_2e_cs__s.curr.slice<0>().concat(p_uio__in.slice<0>()).val() : value<2>{0x3u});
	}
	// cells $procdff$722 $procmux$611
	if (posedge_p_clk) {
		p_core_2e_acc.next = (p_rst__n ? i_flatten_5c_core_2e__24_add_24_chip_2f_src_2f_uds__core_2e_v_3a_324_24_374__Y.slice<11,0>().val() : value<12>{0u});
	}
	// cells $procdff$720 $procmux$560 $procmux$557 $procmux$555 $flatten\core.$not$chip/src/uds_core.v:305$351
	if (posedge_p_clk) {
		p_core_2e_sq7.next = (p_rst__n ? (p_core_2e_fend ? (i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_305_24_350__Y ? not_u<1>(p_core_2e_sq7.curr) : p_core_2e_sq7.curr) : p_core_2e_sq7.curr) : value<1>{0u});
	}
	// cells $procdff$721 $procmux$608
	if (posedge_p_clk) {
		p_core_2e_audio.next = (p_rst__n ? i_flatten_5c_core_2e__24_add_24_chip_2f_src_2f_uds__core_2e_v_3a_324_24_374__Y.slice<12>().val() : value<1>{0u});
	}
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:73.3-97.6
	// cell $procdff$725
	if (posedge_p_clk) {
		p_spi_2e_mosi__s.next = p_uio__in.slice<1>().val();
	}
	// cells $procdff$726 $procmux$656 $procmux$653 $procmux$650 $flatten\spi.$add$chip/src/uds_spi.v:89$412
	if (posedge_p_clk) {
		p_spi_2e_bitcnt.next = (p_rst__n ? (i_flatten_5c_spi_2e__24_logic__not_24_chip_2f_src_2f_uds__spi_2e_v_3a_84_24_411__Y ? value<3>{0u} : (p_spi_2e_rise ? add_uu<3>(p_spi_2e_bitcnt.curr, value<3>{0x1u}) : p_spi_2e_bitcnt.curr)) : value<3>{0u});
	}
	// cells $procdff$727 $procmux$648 $procmux$645 $procmux$642 $procmux$640 $procmux$638 $flatten\spi.$ne$chip/src/uds_spi.v:91$414 $flatten\spi.$add$chip/src/uds_spi.v:91$415
	if (posedge_p_clk) {
		p_spi_2e_bytecnt.next = (p_rst__n ? (i_flatten_5c_spi_2e__24_logic__not_24_chip_2f_src_2f_uds__spi_2e_v_3a_84_24_411__Y ? value<2>{0u} : (p_spi_2e_rise ? (i_flatten_5c_spi_2e__24_eq_24_chip_2f_src_2f_uds__spi_2e_v_3a_90_24_413__Y ? (ne_uu<1>(p_spi_2e_bytecnt.curr, value<2>{0x3u}) ? add_uu<2>(p_spi_2e_bytecnt.curr, value<2>{0x1u}) : p_spi_2e_bytecnt.curr) : p_spi_2e_bytecnt.curr) : p_spi_2e_bytecnt.curr)) : value<2>{0u});
	}
	// cells $procdff$728 $procmux$636 $procmux$633 $procmux$630 $procmux$628 $procmux$626 $flatten\spi.$eq$chip/src/uds_spi.v:93$418 $procmux$624 $flatten\spi.$eq$chip/src/uds_spi.v:92$416 $flatten\spi.$eq$chip/src/uds_spi.v:92$417
	if (posedge_p_clk) {
		p_spi_2e_is__hit.next = (p_rst__n ? (i_flatten_5c_spi_2e__24_logic__not_24_chip_2f_src_2f_uds__spi_2e_v_3a_84_24_411__Y ? value<1>{0u} : (p_spi_2e_rise ? (i_flatten_5c_spi_2e__24_eq_24_chip_2f_src_2f_uds__spi_2e_v_3a_90_24_413__Y ? (eq_uu<1>(p_spi_2e_bytecnt.curr, value<2>{0x3u}) ? value<1>{0u} : (logic_not<1>(p_spi_2e_bytecnt.curr) ? eq_uu<1>(p_spi_2e_byte__in.slice<7,3>().val(), value<5>{0x3u}) : p_spi_2e_is__hit.curr)) : p_spi_2e_is__hit.curr) : p_spi_2e_is__hit.curr)) : value<1>{0u});
	}
	// cells $procdff$716 $procmux$592 $procmux$589 $procmux$587 $flatten\core.$add$chip/src/uds_core.v:304$349
	if (posedge_p_clk) {
		p_core_2e_m5.next = (p_rst__n ? (p_core_2e_fend ? (i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_304_24_347__Y ? value<3>{0u} : add_uu<3>(p_core_2e_m5.curr, value<3>{0x1u})) : p_core_2e_m5.curr) : value<3>{0u});
	}
	// cells $procdff$718 $procmux$576 $procmux$573 $procmux$571 $flatten\core.$not$chip/src/uds_core.v:303$345
	if (posedge_p_clk) {
		p_core_2e_sq3.next = (p_rst__n ? (p_core_2e_fend ? (i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_303_24_344__Y ? not_u<1>(p_core_2e_sq3.curr) : p_core_2e_sq3.curr) : p_core_2e_sq3.curr) : value<1>{0u});
	}
	// cells $procdff$729 $procmux$664 $procmux$658 $flatten\spi.$logic_and$chip/src/uds_spi.v:103$422 $flatten\spi.$eq$chip/src/uds_spi.v:103$421
	if (posedge_p_clk) {
		p_spi_2e_ch.next = (p_rst__n ? (logic_and<1>(p_spi_2e_cmd__end, eq_uu<1>(p_spi_2e_byte__in.slice<7,3>().val(), value<5>{0x3u})) ? p_spi_2e_sr.curr.slice<1,0>().concat(p_spi_2e_mosi__s.curr).val() : p_spi_2e_ch.curr) : value<3>{0u});
	}
	// cells $procdff$724 $procmux$619
	if (posedge_p_clk) {
		p_spi_2e_sck__s.next = (p_rst__n ? p_spi_2e_sck__s.curr.slice<1,0>().concat(p_uio__in.slice<3>()).val() : value<3>{0u});
	}
	// cells $procdff$717 $procmux$584 $procmux$581 $procmux$579 $flatten\core.$add$chip/src/uds_core.v:305$352
	if (posedge_p_clk) {
		p_core_2e_m7.next = (p_rst__n ? (p_core_2e_fend ? (i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_305_24_350__Y ? value<3>{0u} : add_uu<3>(p_core_2e_m7.curr, value<3>{0x1u})) : p_core_2e_m7.curr) : value<3>{0u});
	}
	// cells $procdff$719 $procmux$568 $procmux$565 $procmux$563 $flatten\core.$not$chip/src/uds_core.v:304$348
	if (posedge_p_clk) {
		p_core_2e_sq5.next = (p_rst__n ? (p_core_2e_fend ? (i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_304_24_347__Y ? not_u<1>(p_core_2e_sq5.curr) : p_core_2e_sq5.curr) : p_core_2e_sq5.curr) : value<1>{0u});
	}
	// cells $procdff$693 $procmux$426 $flatten\core.$ternary$chip/src/uds_core.v:71$232 $flatten\core.$add$chip/src/uds_core.v:71$231
	if (posedge_p_clk) {
		p_core_2e_t.next = (p_rst__n ? (p_core_2e_wend ? value<6>{0u} : add_uu<6>(p_core_2e_t.curr, value<6>{0x1u})) : value<6>{0u});
	}
	// cells $procdff$694 $procmux$441 $procmux$438 $flatten\core.$ternary$chip/src/uds_core.v:72$235 $flatten\core.$add$chip/src/uds_core.v:72$234
	if (posedge_p_clk) {
		p_core_2e_v.next = (p_rst__n ? (p_core_2e_wend ? (p_core_2e_v.curr ? value<1>{0u} : add_uu<1>(p_core_2e_v.curr, value<1>{0x1u})) : p_core_2e_v.curr) : value<1>{0u});
	}
	// cells $procdff$695 $procmux$436 $procmux$433 $flatten\core.$add$chip/src/uds_core.v:74$236
	if (posedge_p_clk) {
		p_core_2e_frame.next = (p_rst__n ? (p_core_2e_fend ? add_uu<13>(p_core_2e_frame.curr, value<13>{0x1u}) : p_core_2e_frame.curr) : value<13>{0u});
	}
	// cells $procdff$696 $procmux$431 $procmux$428
	if (posedge_p_clk) {
		p_core_2e_clearing.next = (p_rst__n ? (p_core_2e_fend ? value<1>{0u} : p_core_2e_clearing.curr) : value<1>{0x1u});
	}
	// cells $procdff$697 $procmux$488 $procmux$485 $procmux$482 $procmux$456 $procmux$457_CMP0 $procmux$458_CMP0 $procmux$459_ANY $flatten\core.$ternary$chip/src/uds_core.v:179$302 $flatten\core.$logic_and$chip/src/uds_core.v:179$301 $flatten\core.$shiftx$chip/src/uds_core.v:0$300 $flatten\core.$logic_not$chip/src/uds_core.v:179$299 $flatten\core.$reduce_and$chip/src/uds_core.v:179$298 $flatten\core.$shiftx$chip/src/uds_core.v:0$297 $flatten\core.$eq$chip/src/uds_core.v:181$303 $procmux$479 $procmux$476 $procmux$473 $flatten\core.$logic_and$chip/src/uds_core.v:188$307 $flatten\core.$ternary$chip/src/uds_core.v:188$306 $flatten\core.$xor$chip/src/uds_core.v:147$266 $flatten\core.$xor$chip/src/uds_core.v:147$265 $flatten\core.$logic_not$chip/src/uds_core.v:188$305 $procmux$470 $procmux$467 $procmux$464 $procmux$461 $flatten\core.$eq$chip/src/uds_core.v:138$257 $flatten\core.$xor$chip/src/uds_core.v:155$276 $flatten\core.$xor$chip/src/uds_core.v:155$275
	if (posedge_p_clk) {
		p_core_2e_ring.next = p_core_2e_ring.curr.slice<94,0>().concat((p_core_2e_clearing.curr ? value<1>{0u} : (p_core_2e_clearing.curr ? value<1>{0u} : (p_core_2e_committing ? (eq_uu<1>(p_core_2e_t.curr.slice<5,3>().val(), value<3>{0x3u}) ? (p_core_2e_t.curr.slice<2>().val() ? logic_and<1>(logic_not<1>(reduce_and<1>(p_core_2e_t.curr.slice<1,0>().val())), shiftx_uu<1>(p_core_2e_hit__ch, p_core_2e_t.curr.slice<1,0>().val())) : p_spi_2e_sr.curr.slice<23>().val()) : (eq_uu<1>(p_core_2e_t.curr.slice<5,3>().val(), value<3>{0x2u}) ? shiftx_uu<1>(p_spi_2e_sr.curr.slice<19,16>().val(), p_core_2e_ej.slice<1,0>().val()) : (reduce_or<1>(i_procmux_24_459__CMP) ? p_spi_2e_sr.curr.slice<23>().val() : eq_uu<1>(p_core_2e_t.curr.slice<3,0>().val(), value<4>{0xeu})))) : (p_core_2e_clearing.curr ? value<1>{0u} : (p_core_2e_committing ? value<1>{0u} : (p_core_2e_in__env ? logic_and<1>(logic_not<1>(p_core_2e_kill.curr), (p_core_2e_c__dec.curr ? xor_uu<1>(xor_uu<1>(p_core_2e_head, p_core_2e_d__bit), p_core_2e_bor__in) : p_core_2e_head)) : (p_core_2e_clearing.curr ? value<1>{0u} : (p_core_2e_committing ? value<1>{0u} : (p_core_2e_in__env ? value<1>{0u} : (eq_uu<1>(p_core_2e_t.curr.slice<5,4>().val(), value<2>{0x2u}) ? xor_uu<1>(xor_uu<1>(p_core_2e_head, p_core_2e_inc__bit), p_core_2e_cy__in) : p_core_2e_ring.curr.slice<95>().val()))))))))))).val();
	}
	// cells $procdff$698 $procmux$453 $flatten\core.$not$chip/src/uds_core.v:111$244
	if (posedge_p_clk) {
		p_core_2e_c__tri.next = (p_core_2e_wend ? not_u<1>(i_flatten_5c_core_2e__24_xor_24_chip_2f_src_2f_uds__core_2e_v_3a_110_24_243__Y.slice<8>().val()).concat(i_flatten_5c_core_2e__24_xor_24_chip_2f_src_2f_uds__core_2e_v_3a_110_24_243__Y.slice<7,0>()).val() : p_core_2e_c__tri.curr);
	}
	// cells $procdff$699 $procmux$451
	if (posedge_p_clk) {
		p_core_2e_c__env.next = (p_core_2e_wend ? p_core_2e_ring.curr.slice<71>().concat(p_core_2e_ring.curr.slice<72>()).concat(p_core_2e_ring.curr.slice<73>()).concat(p_core_2e_ring.curr.slice<74>()).concat(p_core_2e_ring.curr.slice<75>()).concat(p_core_2e_ring.curr.slice<76>()).concat(p_core_2e_ring.curr.slice<77>()).concat(p_core_2e_ring.curr.slice<78>()).val() : p_core_2e_c__env.curr);
	}
	// cells $procdff$700 $procmux$449
	if (posedge_p_clk) {
		p_core_2e_c__bal.next = (p_core_2e_wend ? p_core_2e_ring.curr.slice<70,67>().val() : p_core_2e_c__bal.curr);
	}
	// cells $procdff$701 $procmux$447 $flatten\core.$and$chip/src/uds_core.v:130$249 $flatten\core.$or$chip/src/uds_core.v:130$248
	if (posedge_p_clk) {
		p_core_2e_c__metal.next = (p_core_2e_wend ? and_uu<1>(p_core_2e_n__ch.slice<2>().val(), or_uu<1>(p_core_2e_n__ch.slice<1>().val(), p_core_2e_n__ch.slice<0>().val())) : p_core_2e_c__metal.curr);
	}
	// cells $procdff$702 $procmux$445 $flatten\core.$ternary$chip/src/uds_core.v:107$242
	if (posedge_p_clk) {
		p_core_2e_c__pe.next = (p_core_2e_wend ? (p_core_2e_pe__raw.slice<8>().val() ? value<8>{0xffu} : p_core_2e_pe__raw.slice<7,0>().val()) : p_core_2e_c__pe.curr);
	}
	// cells $procdff$703 $procmux$443 $flatten\core.$eq$chip/src/uds_core.v:133$250 $flatten\core.$and$chip/src/uds_core.v:133$255 $flatten\core.$logic_not$chip/src/uds_core.v:133$254 $flatten\core.$reduce_or$chip/src/uds_core.v:133$253 $flatten\core.$and$chip/src/uds_core.v:133$252 $flatten\core.$not$chip/src/uds_core.v:123$246 $flatten\core.$shl$chip/src/uds_core.v:123$245 $flatten\core.$reduce_or$chip/src/uds_core.v:133$251
	if (posedge_p_clk) {
		p_core_2e_c__dec.next = (logic_not<1>(p_core_2e_t.curr) ? and_uu<1>(reduce_or<1>(p_core_2e_c__env.curr), logic_not<1>(reduce_or<1>(and_uu<13>(p_core_2e_frame.curr, not_u<13>(shl_uu<13>(value<13>{0x1fffu}, p_core_2e_ring.curr.slice<87,84>().val())))))) : p_core_2e_c__dec.curr);
	}
	// cells $procdff$704 $flatten\core.$or$chip/src/uds_core.v:158$282 $flatten\core.$and$chip/src/uds_core.v:158$281 $flatten\core.$and$chip/src/uds_core.v:158$280 $flatten\core.$or$chip/src/uds_core.v:158$279 $flatten\core.$not$chip/src/uds_core.v:158$278
	if (posedge_p_clk) {
		p_core_2e_bor.next = or_uu<1>(and_uu<1>(not_u<1>(p_core_2e_head), or_uu<1>(p_core_2e_d__bit, p_core_2e_bor__in)), and_uu<1>(p_core_2e_d__bit, p_core_2e_bor__in));
	}
	// cells $procdff$705 $flatten\core.$or$chip/src/uds_core.v:159$287 $flatten\core.$and$chip/src/uds_core.v:159$286 $flatten\core.$or$chip/src/uds_core.v:159$285 $flatten\core.$and$chip/src/uds_core.v:159$284 $flatten\core.$and$chip/src/uds_core.v:159$283
	if (posedge_p_clk) {
		p_core_2e_cy.next = or_uu<1>(or_uu<1>(and_uu<1>(p_core_2e_head, p_core_2e_inc__bit), and_uu<1>(p_core_2e_head, p_core_2e_cy__in)), and_uu<1>(p_core_2e_inc__bit, p_core_2e_cy__in));
	}
	// cells $procdff$706 $procmux$552 $procmux$549
	if (posedge_p_clk) {
		p_core_2e_status.next = (p_rst__n ? (p_core_2e_fend ? value<8>{0u} : p_core_2e_status.curr) : value<8>{0u});
	}
	// cells $procdff$707 $procmux$535 $flatten\core.$or$chip/src/uds_core.v:279$336 $flatten\core.$and$chip/src/uds_core.v:279$335 $flatten\core.$logic_not$chip/src/uds_core.v:279$334 $flatten\spi.$logic_and$chip/src/uds_spi.v:66$405 $flatten\spi.$logic_and$chip/src/uds_spi.v:66$404 $flatten\spi.$eq$chip/src/uds_spi.v:66$403 $flatten\spi.$logic_and$chip/src/uds_spi.v:66$402 $flatten\spi.$eq$chip/src/uds_spi.v:66$401
	if (posedge_p_clk) {
		p_core_2e_pend.next = (p_rst__n ? or_uu<1>(logic_and<1>(logic_and<1>(logic_and<1>(p_spi_2e_rise, eq_uu<1>(p_spi_2e_bitcnt.curr, value<3>{0x7u})), eq_uu<1>(p_spi_2e_bytecnt.curr, value<2>{0x3u})), p_spi_2e_is__hit.curr), and_uu<1>(p_core_2e_pend.curr, logic_not<1>(p_core_2e_fend))) : value<1>{0u});
	}
	// cells $procdff$708 $procmux$547 $procmux$544
	if (posedge_p_clk) {
		p_core_2e_commit.next = (p_rst__n ? (p_core_2e_fend ? p_core_2e_pend.curr : p_core_2e_commit.curr) : value<1>{0u});
	}
	// cells $procdff$709 $procmux$542 $flatten\core.$logic_and$chip/src/uds_core.v:287$340 $procmux$491 $procmux$494 $procmux$497 $procmux$500 $procmux$503 $flatten\core.$lt$chip/src/uds_core.v:224$311
	if (posedge_p_clk) {
		p_core_2e_tgt.next = (logic_and<1>(p_core_2e_fend, p_core_2e_pend.curr) ? (p_core_2e_same.slice<0>().val() ? value<1>{0u} : (p_core_2e_same.slice<1>().val() ? value<1>{0x1u} : (i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_377__Y ? (i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_384__Y ? (lt_uu<1>(p_core_2e_envhi.slice<5,3>().val(), p_core_2e_envhi.slice<2,0>().val()) ? value<1>{0x1u} : value<1>{0u}) : value<1>{0x1u}) : value<1>{0u}))) : p_core_2e_tgt.curr);
	}
	// cells $procdff$710 $procmux$540 $procmux$537
	if (posedge_p_clk) {
		p_core_2e_kill.next = (p_rst__n ? (p_core_2e_fend ? p_core_2e_kill__pend.curr : p_core_2e_kill.curr) : value<1>{0u});
	}
	// cells $procdff$711 $procmux$532 $flatten\core.$or$chip/src/uds_core.v:280$339 $flatten\core.$and$chip/src/uds_core.v:280$338 $flatten\core.$logic_not$chip/src/uds_core.v:280$337 $flatten\spi.$logic_and$chip/src/uds_spi.v:67$407 $flatten\spi.$eq$chip/src/uds_spi.v:67$406
	if (posedge_p_clk) {
		p_core_2e_kill__pend.next = (p_rst__n ? or_uu<1>(logic_and<1>(p_spi_2e_cmd__end, eq_uu<1>(p_spi_2e_byte__in, value<8>{0x40u})), and_uu<1>(p_core_2e_kill__pend.curr, logic_not<1>(p_core_2e_fend))) : value<1>{0u});
	}
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:267.3-288.6
	// cell $procdff$712
	if (posedge_p_clk) {
		p_core_2e_trig__s.next = value<8>{0u};
	}
	// cells $procdff$713 $procmux$527 $flatten\core.$and$chip/src/uds_core.v:278$332
	if (posedge_p_clk) {
		p_core_2e_served.next = (p_rst__n ? and_uu<8>(p_core_2e_served.curr, p_core_2e_trig__s.curr) : value<8>{0u});
	}
	// cells $procdff$714 $procmux$605 $procmux$602 $flatten\core.$xor$chip/src/uds_core.v:302$343
	if (posedge_p_clk) {
		p_core_2e_lfsr.next = (p_rst__n ? (p_core_2e_fend ? p_core_2e_lfsr.curr.slice<15,0>().concat(xor_uu<1>(p_core_2e_lfsr.curr.slice<16>().val(), p_core_2e_lfsr.curr.slice<13>().val())).val() : p_core_2e_lfsr.curr) : value<17>{0x1u});
	}
	// cells $procdff$715 $procmux$600 $procmux$597 $procmux$595 $flatten\core.$add$chip/src/uds_core.v:303$346
	if (posedge_p_clk) {
		p_core_2e_m3.next = (p_rst__n ? (p_core_2e_fend ? (i_flatten_5c_core_2e__24_eq_24_chip_2f_src_2f_uds__core_2e_v_3a_303_24_344__Y ? value<2>{0u} : add_uu<2>(p_core_2e_m3.curr, value<2>{0x1u})) : p_core_2e_m3.curr) : value<2>{0u});
	}
	// connection
	p_uio__oe = value<8>{0xf4u};
	// cells $flatten\spi.$and$chip/src/uds_spi.v:69$408 $flatten\core.$eq$chip/src/uds_core.v:173$295 $flatten\core.$or$chip/src/uds_core.v:172$294
	p_uio__out = p_audio.repeat<2>().concat(or_uu<1>(p_core_2e_pend.curr, p_core_2e_commit.curr)).concat(not_u<1>(p_core_2e_v.curr)).concat(value<1>{0u}).concat(and_uu<1>(p_spi_2e_active, p_spi_2e_sr.curr.slice<7>().val())).concat(value<2>{0u}).val();
	// cells $procmux$685 $procmux$686_CMP0 $procmux$687_CMP0 $procmux$688_CMP0 $procmux$689_CMP0 $procmux$690_CMP0 $procmux$691_CMP0 $procmux$692_CMP0
	p_uo__out = p_audio.concat((eq_uu<1>(p_hit__ch, value<3>{0x6u}) ? value<7>{0x7du} : (eq_uu<1>(p_hit__ch, value<3>{0x5u}) ? value<7>{0x6du} : (eq_uu<1>(p_hit__ch, value<3>{0x4u}) ? value<7>{0x66u} : (eq_uu<1>(p_hit__ch, value<3>{0x3u}) ? value<7>{0x4fu} : (eq_uu<1>(p_hit__ch, value<3>{0x2u}) ? value<7>{0x5bu} : (eq_uu<1>(p_hit__ch, value<3>{0x1u}) ? value<7>{0x6u} : (logic_not<1>(p_hit__ch) ? value<7>{0x3fu} : value<7>{0x7u})))))))).val();
	return converged;
}

bool p_tt__um__ai__wrangler__uds1x1::commit() {
	bool changed = false;
	if (p_core_2e_status.commit()) changed = true;
	if (p_core_2e_audio.commit()) changed = true;
	if (p_core_2e_t.commit()) changed = true;
	if (p_core_2e_v.commit()) changed = true;
	if (p_core_2e_frame.commit()) changed = true;
	if (p_core_2e_clearing.commit()) changed = true;
	if (p_core_2e_ring.commit()) changed = true;
	if (p_core_2e_c__tri.commit()) changed = true;
	if (p_core_2e_c__env.commit()) changed = true;
	if (p_core_2e_c__bal.commit()) changed = true;
	if (p_core_2e_c__metal.commit()) changed = true;
	if (p_core_2e_c__pe.commit()) changed = true;
	if (p_core_2e_c__dec.commit()) changed = true;
	if (p_core_2e_bor.commit()) changed = true;
	if (p_core_2e_cy.commit()) changed = true;
	if (p_core_2e_pend.commit()) changed = true;
	if (p_core_2e_commit.commit()) changed = true;
	if (p_core_2e_tgt.commit()) changed = true;
	if (p_core_2e_kill.commit()) changed = true;
	if (p_core_2e_kill__pend.commit()) changed = true;
	if (p_core_2e_trig__s.commit()) changed = true;
	if (p_core_2e_served.commit()) changed = true;
	if (p_core_2e_lfsr.commit()) changed = true;
	if (p_core_2e_m3.commit()) changed = true;
	if (p_core_2e_m5.commit()) changed = true;
	if (p_core_2e_m7.commit()) changed = true;
	if (p_core_2e_sq3.commit()) changed = true;
	if (p_core_2e_sq5.commit()) changed = true;
	if (p_core_2e_sq7.commit()) changed = true;
	if (p_core_2e_acc.commit()) changed = true;
	if (p_spi_2e_ch.commit()) changed = true;
	if (p_spi_2e_cs__s.commit()) changed = true;
	if (p_spi_2e_sck__s.commit()) changed = true;
	if (p_spi_2e_mosi__s.commit()) changed = true;
	if (p_spi_2e_bitcnt.commit()) changed = true;
	if (p_spi_2e_bytecnt.commit()) changed = true;
	if (p_spi_2e_is__hit.commit()) changed = true;
	if (p_spi_2e_sr.commit()) changed = true;
	prev_p_clk = p_clk;
	return changed;
}

void p_tt__um__ai__wrangler__uds1x1::debug_eval() {
	value<3> i_procmux_24_518__Y;
	value<2> i_procmux_24_459__CMP;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:155.24-155.46
	value<1> i_flatten_5c_core_2e__24_xor_24_chip_2f_src_2f_uds__core_2e_v_3a_155_24_276__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:224.11-224.33
	value<1> i_flatten_5c_core_2e__24_lt_24_chip_2f_src_2f_uds__core_2e_v_3a_224_24_311__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:243.3-265.6
	value<3> i_flatten_5c_core_2e__24_1_5c_preset__ch_5b_2_3a_0_5d_;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:210.35-210.37
	value<1> i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_377__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:213.35-213.63
	value<8> i_flatten_5c_core_2e__24_ternary_24_chip_2f_src_2f_uds__core_2e_v_3a_213_24_383__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:210.35-210.37
	value<1> i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_384__Y;
	// connection
	p_core_2e_pj = p_core_2e_t.curr.slice<3,0>().val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:151.24-151.55
	// cell $flatten\core.$sub$chip/src/uds_core.v:151$267
	p_core_2e_pk = sub_uu<5>(value<1>{0u}.concat(p_core_2e_pj).val(), value<2>{0u}.concat(p_core_2e_c__pe.curr.slice<7,5>()).val());
	// connection
	p_core_2e_mant = value<1>{0x1u}.concat(p_core_2e_c__pe.curr.slice<4,0>()).val();
	// connection
	p_core_2e_ej = p_core_2e_t.curr.slice<2,0>().val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:144.24-144.42
	// cell $flatten\core.$eq$chip/src/uds_core.v:144$258
	p_core_2e_env__lt8 = logic_not<1>(p_core_2e_c__env.curr.slice<7,3>().val());
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:153$272 $flatten\core.$shiftx$chip/src/uds_core.v:0$271 $flatten\core.$logic_and$chip/src/uds_core.v:153$270 $flatten\core.$le$chip/src/uds_core.v:153$269 $flatten\core.$logic_not$chip/src/uds_core.v:153$268
	p_core_2e_inc__bit = logic_and<1>(logic_and<1>(logic_not<1>(p_core_2e_pk.slice<4>().val()), le_uu<1>(p_core_2e_pk.slice<3,0>().val(), value<4>{0x5u})), shiftx_uu<1>(p_core_2e_mant, p_core_2e_pk.slice<2,0>().val()));
	// connection
	p_core_2e_head = p_core_2e_ring.curr.slice<95>().val();
	// cells $flatten\core.$ternary$chip/src/uds_core.v:154$274 $flatten\core.$eq$chip/src/uds_core.v:154$273
	p_core_2e_cy__in = (logic_not<1>(p_core_2e_pj) ? value<1>{0u} : p_core_2e_cy.curr);
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:138.25-138.40
	// cell $flatten\core.$eq$chip/src/uds_core.v:138$257
	p_core_2e_in__phase = eq_uu<1>(p_core_2e_t.curr.slice<5,4>().val(), value<2>{0x2u});
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<7>() = p_core_2e_ring.curr.slice<23>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<6>() = p_core_2e_ring.curr.slice<24>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<5>() = p_core_2e_ring.curr.slice<25>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<4>() = p_core_2e_ring.curr.slice<26>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<3>() = p_core_2e_ring.curr.slice<27>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<2>() = p_core_2e_ring.curr.slice<28>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<1>() = p_core_2e_ring.curr.slice<29>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_e.slice<0>() = p_core_2e_ring.curr.slice<30>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<7>() = p_core_2e_ring.curr.slice<71>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<6>() = p_core_2e_ring.curr.slice<72>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<5>() = p_core_2e_ring.curr.slice<73>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<4>() = p_core_2e_ring.curr.slice<74>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<3>() = p_core_2e_ring.curr.slice<75>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<2>() = p_core_2e_ring.curr.slice<76>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<1>() = p_core_2e_ring.curr.slice<77>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_e.slice<0>() = p_core_2e_ring.curr.slice<78>().val();
	// cells $flatten\core.$ternary$chip/src/uds_core.v:145$262 $flatten\core.$eq$chip/src/uds_core.v:144$258 $flatten\core.$eq$chip/src/uds_core.v:145$259 $flatten\core.$and$chip/src/uds_core.v:145$261 $flatten\core.$le$chip/src/uds_core.v:145$260
	p_core_2e_d__bit = (p_core_2e_env__lt8 ? logic_not<1>(p_core_2e_ej) : and_uu<1>(p_core_2e_ring.curr.slice<92>().val(), le_uu<1>(p_core_2e_ej, value<3>{0x4u})));
	// cells $flatten\core.$xor$chip/src/uds_core.v:155$276 $flatten\core.$xor$chip/src/uds_core.v:155$275
	i_flatten_5c_core_2e__24_xor_24_chip_2f_src_2f_uds__core_2e_v_3a_155_24_276__Y = xor_uu<1>(xor_uu<1>(p_core_2e_head, p_core_2e_inc__bit), p_core_2e_cy__in);
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:137.25-137.41
	// cell $flatten\core.$eq$chip/src/uds_core.v:137$256
	p_core_2e_in__env = eq_uu<1>(p_core_2e_t.curr.slice<5,3>().val(), value<3>{0x2u});
	// cells $flatten\core.$add$chip/src/uds_core.v:309$355 $flatten\core.$add$chip/src/uds_core.v:309$354 $flatten\core.$add$chip/src/uds_core.v:309$353
	p_core_2e_pc = add_uu<3>(add_uu<3>(add_uu<3>(value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<0>()).val(), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<1>()).val()), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<2>()).val()), value<2>{0u}.concat(p_core_2e_lfsr.curr.slice<3>()).val());
	// connection
	p_core_2e_envhi.slice<5,3>() = p_core_2e_g__slot_5b_1_5d__2e_e.slice<7,5>().val();
	// connection
	p_core_2e_envhi.slice<2,0>() = p_core_2e_g__slot_5b_0_5d__2e_e.slice<7,5>().val();
	// cells $flatten\core.$ternary$chip/src/uds_core.v:146$264 $flatten\core.$eq$chip/src/uds_core.v:146$263
	p_core_2e_bor__in = (logic_not<1>(p_core_2e_ej) ? value<1>{0u} : p_core_2e_bor.curr);
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:168$289 $flatten\core.$eq$chip/src/uds_core.v:168$288
	p_core_2e_committing = logic_and<1>(p_core_2e_commit.curr, eq_uu<1>(p_core_2e_v.curr, p_core_2e_tgt.curr));
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:50.25-50.33
	// cell $flatten\spi.$logic_not$chip/src/uds_spi.v:50$391
	p_spi_2e_active = logic_not<1>(p_spi_2e_cs__s.curr.slice<1>().val());
	// connection
	p_core_2e_q = p_core_2e_c__env.curr.slice<7,3>().val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:224.11-224.33
	// cell $flatten\core.$lt$chip/src/uds_core.v:224$311
	i_flatten_5c_core_2e__24_lt_24_chip_2f_src_2f_uds__core_2e_v_3a_224_24_311__Y = lt_uu<1>(p_core_2e_envhi.slice<5,3>().val(), p_core_2e_envhi.slice<2,0>().val());
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_c.slice<2>() = p_core_2e_ring.curr.slice<16>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_c.slice<1>() = p_core_2e_ring.curr.slice<17>().val();
	// connection
	p_core_2e_g__slot_5b_1_5d__2e_c.slice<0>() = p_core_2e_ring.curr.slice<18>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_c.slice<2>() = p_core_2e_ring.curr.slice<64>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_c.slice<1>() = p_core_2e_ring.curr.slice<65>().val();
	// connection
	p_core_2e_g__slot_5b_0_5d__2e_c.slice<0>() = p_core_2e_ring.curr.slice<66>().val();
	// cells $flatten\core.$xor$chip/src/uds_core.v:147$266 $flatten\core.$xor$chip/src/uds_core.v:147$265
	p_core_2e_env__new = xor_uu<1>(xor_uu<1>(p_core_2e_head, p_core_2e_d__bit), p_core_2e_bor__in);
	// connection
	p_core_2e_waiting = and_uu<8>(p_core_2e_trig__s.curr, not_u<8>(p_core_2e_served.curr));
	// cells $flatten\core.$ternary$chip/src/uds_core.v:311$361 $flatten\core.$xor$chip/src/uds_core.v:311$360 $flatten\core.$xor$chip/src/uds_core.v:311$359 $flatten\core.$xor$chip/src/uds_core.v:311$358
	p_core_2e_metal = (xor_uu<1>(xor_uu<1>(xor_uu<1>(p_core_2e_sq3.curr, p_core_2e_sq5.curr), p_core_2e_sq7.curr), p_core_2e_frame.curr.slice<2>().val()) ? value<9>{0xffu} : value<9>{0x100u});
	// cells $flatten\core.$ternary$chip/src/uds_core.v:310$357 $flatten\core.$not$chip/src/uds_core.v:310$356
	p_core_2e_drum = (p_core_2e_pc.slice<2>().val() ? value<9>{0xffu} : not_u<1>(p_core_2e_pc.slice<1>().val()).concat(p_core_2e_pc.slice<0>()).concat(value<7>{0u}).val());
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:316.23-316.55
	// cell $flatten\core.$add$chip/src/uds_core.v:316$362
	p_core_2e_qr = add_uu<6>(value<1>{0u}.concat(p_core_2e_q).val(), value<3>{0u}.concat(p_core_2e_c__env.curr.slice<2,0>()).val());
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:317.23-317.36
	// cell $flatten\core.$lt$chip/src/uds_core.v:317$363
	p_core_2e_w8 = lt_uu<1>(p_core_2e_t.curr, value<1>{0u}.concat(p_core_2e_q).val());
	// connection
	p_spi_2e_payload__msb = p_spi_2e_sr.curr.slice<23>().val();
	// connection
	p_spi_2e_level = p_spi_2e_sr.curr.slice<19,16>().val();
	// cells $flatten\spi.$logic_and$chip/src/uds_spi.v:51$394 $flatten\spi.$logic_not$chip/src/uds_spi.v:51$393 $flatten\spi.$logic_and$chip/src/uds_spi.v:51$392
	p_spi_2e_rise = logic_and<1>(logic_and<1>(p_spi_2e_active, p_spi_2e_sck__s.curr.slice<1>().val()), logic_not<1>(p_spi_2e_sck__s.curr.slice<2>().val()));
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:319.23-319.55
	// cell $flatten\core.$lt$chip/src/uds_core.v:319$367
	p_core_2e_sel__n = lt_uu<1>(p_core_2e_t.curr.slice<0>().concat(p_core_2e_t.curr.slice<1>()).concat(p_core_2e_t.curr.slice<2>()).concat(p_core_2e_t.curr.slice<3>()).val(), p_core_2e_c__bal.curr);
	// connection
	p_core_2e_nw.slice<47>() = p_core_2e_ring.curr.slice<47>().val();
	// connection
	p_core_2e_nw.slice<46>() = p_core_2e_ring.curr.slice<48>().val();
	// connection
	p_core_2e_nw.slice<45>() = p_core_2e_ring.curr.slice<49>().val();
	// connection
	p_core_2e_nw.slice<44>() = p_core_2e_ring.curr.slice<50>().val();
	// connection
	p_core_2e_nw.slice<43>() = p_core_2e_ring.curr.slice<51>().val();
	// connection
	p_core_2e_nw.slice<42>() = p_core_2e_ring.curr.slice<52>().val();
	// connection
	p_core_2e_nw.slice<41>() = p_core_2e_ring.curr.slice<53>().val();
	// connection
	p_core_2e_nw.slice<40>() = p_core_2e_ring.curr.slice<54>().val();
	// connection
	p_core_2e_nw.slice<39>() = p_core_2e_ring.curr.slice<55>().val();
	// connection
	p_core_2e_nw.slice<38>() = p_core_2e_ring.curr.slice<56>().val();
	// connection
	p_core_2e_nw.slice<37>() = p_core_2e_ring.curr.slice<57>().val();
	// connection
	p_core_2e_nw.slice<36>() = p_core_2e_ring.curr.slice<58>().val();
	// connection
	p_core_2e_nw.slice<35>() = p_core_2e_ring.curr.slice<59>().val();
	// connection
	p_core_2e_nw.slice<34>() = p_core_2e_ring.curr.slice<60>().val();
	// connection
	p_core_2e_nw.slice<33>() = p_core_2e_ring.curr.slice<61>().val();
	// connection
	p_core_2e_nw.slice<32>() = p_core_2e_ring.curr.slice<62>().val();
	// connection
	p_core_2e_nw.slice<31>() = p_core_2e_ring.curr.slice<63>().val();
	// connection
	p_core_2e_nw.slice<30>() = p_core_2e_ring.curr.slice<64>().val();
	// connection
	p_core_2e_nw.slice<29>() = p_core_2e_ring.curr.slice<65>().val();
	// connection
	p_core_2e_nw.slice<28>() = p_core_2e_ring.curr.slice<66>().val();
	// connection
	p_core_2e_nw.slice<27>() = p_core_2e_ring.curr.slice<67>().val();
	// connection
	p_core_2e_nw.slice<26>() = p_core_2e_ring.curr.slice<68>().val();
	// connection
	p_core_2e_nw.slice<25>() = p_core_2e_ring.curr.slice<69>().val();
	// connection
	p_core_2e_nw.slice<24>() = p_core_2e_ring.curr.slice<70>().val();
	// connection
	p_core_2e_nw.slice<23>() = p_core_2e_ring.curr.slice<71>().val();
	// connection
	p_core_2e_nw.slice<22>() = p_core_2e_ring.curr.slice<72>().val();
	// connection
	p_core_2e_nw.slice<21>() = p_core_2e_ring.curr.slice<73>().val();
	// connection
	p_core_2e_nw.slice<20>() = p_core_2e_ring.curr.slice<74>().val();
	// connection
	p_core_2e_nw.slice<19>() = p_core_2e_ring.curr.slice<75>().val();
	// connection
	p_core_2e_nw.slice<18>() = p_core_2e_ring.curr.slice<76>().val();
	// connection
	p_core_2e_nw.slice<17>() = p_core_2e_ring.curr.slice<77>().val();
	// connection
	p_core_2e_nw.slice<16>() = p_core_2e_ring.curr.slice<78>().val();
	// connection
	p_core_2e_nw.slice<15>() = p_core_2e_ring.curr.slice<79>().val();
	// connection
	p_core_2e_nw.slice<14>() = p_core_2e_ring.curr.slice<80>().val();
	// connection
	p_core_2e_nw.slice<13>() = p_core_2e_ring.curr.slice<81>().val();
	// connection
	p_core_2e_nw.slice<12>() = p_core_2e_ring.curr.slice<82>().val();
	// connection
	p_core_2e_nw.slice<11>() = p_core_2e_ring.curr.slice<83>().val();
	// connection
	p_core_2e_nw.slice<10>() = p_core_2e_ring.curr.slice<84>().val();
	// connection
	p_core_2e_nw.slice<9>() = p_core_2e_ring.curr.slice<85>().val();
	// connection
	p_core_2e_nw.slice<8>() = p_core_2e_ring.curr.slice<86>().val();
	// connection
	p_core_2e_nw.slice<7>() = p_core_2e_ring.curr.slice<87>().val();
	// connection
	p_core_2e_nw.slice<6>() = p_core_2e_ring.curr.slice<88>().val();
	// connection
	p_core_2e_nw.slice<5>() = p_core_2e_ring.curr.slice<89>().val();
	// connection
	p_core_2e_nw.slice<4>() = p_core_2e_ring.curr.slice<90>().val();
	// connection
	p_core_2e_nw.slice<3>() = p_core_2e_ring.curr.slice<91>().val();
	// connection
	p_core_2e_nw.slice<2>() = p_core_2e_ring.curr.slice<92>().val();
	// connection
	p_core_2e_nw.slice<1>() = p_core_2e_ring.curr.slice<93>().val();
	// connection
	p_core_2e_nw.slice<0>() = p_core_2e_ring.curr.slice<94>().val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:210.35-210.37
	// cell $flatten\core.$reduce_or$chip/src/uds_core.v:210$384
	i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_384__Y = reduce_or<1>(p_core_2e_g__slot_5b_1_5d__2e_e);
	// cells $flatten\core.$ternary$chip/src/uds_core.v:198$309 $flatten\core.$eq$chip/src/uds_core.v:198$308
	p_core_2e_hgrp = (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x7u}) ? value<3>{0x6u} : p_spi_2e_ch.curr);
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:210.35-210.37
	// cell $flatten\core.$reduce_or$chip/src/uds_core.v:210$377
	i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_377__Y = reduce_or<1>(p_core_2e_g__slot_5b_0_5d__2e_e);
	// connection
	p_spi_2e_byte__in = p_spi_2e_sr.curr.slice<6,0>().concat(p_spi_2e_mosi__s.curr).val();
	// connection
	p_core_2e_n__env = p_core_2e_nw.slice<23,16>().val();
	// connection
	p_core_2e_c0__decay = p_core_2e_ring.curr.slice<87,84>().val();
	// connection
	p_core_2e_act.slice<1>() = i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_384__Y;
	// connection
	p_core_2e_act.slice<0>() = i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_377__Y;
	// \full_case: 1
	// \src: chip/src/uds_core.v:176.5-182.12
	// cell $procmux$459_CMP0
	i_procmux_24_459__CMP.slice<0>() = logic_not<1>(p_core_2e_t.curr.slice<5,3>().val());
	// \full_case: 1
	// \src: chip/src/uds_core.v:176.5-182.12
	// cell $procmux$459_CMP1
	i_procmux_24_459__CMP.slice<1>() = eq_uu<1>(p_core_2e_t.curr.slice<5,3>().val(), value<3>{0x1u});
	// cells $flatten\core.$ternary$chip/src/uds_core.v:320$369 $flatten\core.$lt$chip/src/uds_core.v:319$367 $flatten\core.$ternary$chip/src/uds_core.v:320$368 $flatten\core.$ternary$chip/src/uds_core.v:311$361 $flatten\core.$xor$chip/src/uds_core.v:311$360 $flatten\core.$xor$chip/src/uds_core.v:311$359 $flatten\core.$xor$chip/src/uds_core.v:311$358 $flatten\core.$ternary$chip/src/uds_core.v:310$357 $flatten\core.$not$chip/src/uds_core.v:310$356
	p_core_2e_src = (p_core_2e_sel__n ? (p_core_2e_c__metal.curr ? p_core_2e_metal : p_core_2e_drum) : p_core_2e_c__tri.curr);
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:318$366 $flatten\core.$lt$chip/src/uds_core.v:318$365 $flatten\core.$add$chip/src/uds_core.v:316$362 $flatten\core.$logic_not$chip/src/uds_core.v:318$364
	p_core_2e_w1 = logic_and<1>(logic_not<1>(p_core_2e_w8), lt_uu<1>(p_core_2e_t.curr, p_core_2e_qr));
	// connection
	p_core_2e_n__sweep = p_core_2e_nw.slice<12>().concat(p_core_2e_nw.slice<13>()).concat(p_core_2e_nw.slice<14>()).concat(p_core_2e_nw.slice<15>()).val();
	// connection
	p_core_2e_first = and_uu<8>(p_core_2e_waiting, add_uu<8>(not_u<8>(p_core_2e_waiting), value<8>{0x1u}));
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:54.25-54.45
	// cell $flatten\spi.$eq$chip/src/uds_spi.v:54$399
	p_spi_2e_read__cmd = eq_uu<1>(p_spi_2e_byte__in.slice<7,4>().val(), value<4>{0x3u});
	// cells $flatten\spi.$logic_and$chip/src/uds_spi.v:53$398 $flatten\spi.$eq$chip/src/uds_spi.v:53$397 $flatten\spi.$logic_and$chip/src/uds_spi.v:53$396 $flatten\spi.$eq$chip/src/uds_spi.v:53$395
	p_spi_2e_cmd__end = logic_and<1>(logic_and<1>(p_spi_2e_rise, eq_uu<1>(p_spi_2e_bitcnt.curr, value<3>{0x7u})), logic_not<1>(p_spi_2e_bytecnt.curr));
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:104.23-104.51
	// cell $flatten\core.$ternary$chip/src/uds_core.v:104$238
	p_core_2e_up = (p_core_2e_n__env.slice<7>().val() ? p_core_2e_n__env.slice<6,0>().val() : value<7>{0u});
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:61.24-61.34
	// cell $flatten\core.$eq$chip/src/uds_core.v:61$226
	p_core_2e_wend = eq_uu<1>(p_core_2e_t.curr, value<6>{0x2fu});
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:211$388 $flatten\core.$eq$chip/src/uds_core.v:211$387 $flatten\core.$ternary$chip/src/uds_core.v:211$386 $flatten\core.$eq$chip/src/uds_core.v:211$385
	p_core_2e_same.slice<1>() = logic_and<1>(p_core_2e_act.slice<1>().val(), eq_uu<1>((eq_uu<1>(p_core_2e_g__slot_5b_1_5d__2e_c, value<3>{0x7u}) ? value<3>{0x6u} : p_core_2e_g__slot_5b_1_5d__2e_c), p_core_2e_hgrp));
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:211$381 $flatten\core.$eq$chip/src/uds_core.v:211$380 $flatten\core.$ternary$chip/src/uds_core.v:211$379 $flatten\core.$eq$chip/src/uds_core.v:211$378
	p_core_2e_same.slice<0>() = logic_and<1>(p_core_2e_act.slice<0>().val(), eq_uu<1>((eq_uu<1>(p_core_2e_g__slot_5b_0_5d__2e_c, value<3>{0x7u}) ? value<3>{0x6u} : p_core_2e_g__slot_5b_0_5d__2e_c), p_core_2e_hgrp));
	// cells $flatten\core.$logic_and$chip/src/uds_core.v:171$293 $flatten\core.$logic_or$chip/src/uds_core.v:171$292 $flatten\core.$eq$chip/src/uds_core.v:171$291 $flatten\core.$eq$chip/src/uds_core.v:171$290
	p_core_2e_commit__shift = logic_and<1>(p_core_2e_committing, logic_or<1>(logic_not<1>(p_core_2e_t.curr.slice<5,4>().val()), eq_uu<1>(p_core_2e_t.curr.slice<5,2>().val(), value<4>{0x6u})));
	// cells $flatten\core.$not$chip/src/uds_core.v:123$246 $flatten\core.$shl$chip/src/uds_core.v:123$245
	p_core_2e_dmask = not_u<13>(shl_uu<13>(value<13>{0x1fffu}, p_core_2e_c0__decay));
	// cells $procmux$456 $procmux$457_CMP0 $procmux$458_CMP0 $procmux$459_ANY $flatten\core.$ternary$chip/src/uds_core.v:179$302 $flatten\core.$logic_and$chip/src/uds_core.v:179$301 $flatten\core.$shiftx$chip/src/uds_core.v:0$300 $flatten\core.$logic_not$chip/src/uds_core.v:179$299 $flatten\core.$reduce_and$chip/src/uds_core.v:179$298 $flatten\core.$shiftx$chip/src/uds_core.v:0$297 $flatten\core.$eq$chip/src/uds_core.v:181$303
	p_core_2e_tail__commit = (eq_uu<1>(p_core_2e_t.curr.slice<5,3>().val(), value<3>{0x3u}) ? (p_core_2e_t.curr.slice<2>().val() ? logic_and<1>(logic_not<1>(reduce_and<1>(p_core_2e_t.curr.slice<1,0>().val())), shiftx_uu<1>(p_spi_2e_ch.curr, p_core_2e_t.curr.slice<1,0>().val())) : p_spi_2e_payload__msb) : (eq_uu<1>(p_core_2e_t.curr.slice<5,3>().val(), value<3>{0x2u}) ? shiftx_uu<1>(p_spi_2e_level, p_core_2e_ej.slice<1,0>().val()) : (reduce_or<1>(i_procmux_24_459__CMP) ? p_spi_2e_sr.curr.slice<23>().val() : eq_uu<1>(p_core_2e_t.curr.slice<3,0>().val(), value<4>{0xeu}))));
	// \full_case: 1
	// \src: chip/src/uds_core.v:244.5-253.12
	// cell $procmux$518
	i_procmux_24_518__Y = (eq_uu<1>(p_core_2e_first, value<8>{0x40u}) ? value<3>{0x6u} : (eq_uu<1>(p_core_2e_first, value<8>{0x20u}) ? value<3>{0x5u} : (eq_uu<1>(p_core_2e_first, value<8>{0x10u}) ? value<3>{0x4u} : (eq_uu<1>(p_core_2e_first, value<8>{0x8u}) ? value<3>{0x3u} : (eq_uu<1>(p_core_2e_first, value<8>{0x4u}) ? value<3>{0x2u} : (eq_uu<1>(p_core_2e_first, value<8>{0x2u}) ? value<3>{0x1u} : (eq_uu<1>(p_core_2e_first, value<8>{0x1u}) ? value<3>{0u} : value<3>{0x7u})))))));
	// cells $procmux$614 $procmux$615_CMP0 $procmux$616_CMP0 $procmux$617_CMP0
	p_spi_2e_read__value = (eq_uu<1>(p_spi_2e_byte__in.slice<1,0>().val(), value<2>{0x2u}) ? p_core_2e_status.curr : (eq_uu<1>(p_spi_2e_byte__in.slice<1,0>().val(), value<2>{0x1u}) ? value<8>{0x12u} : (logic_not<1>(p_spi_2e_byte__in.slice<1,0>().val()) ? value<8>{0xd5u} : value<8>{0u})));
	// connection
	p_core_2e_n__ph = p_core_2e_nw.slice<47,38>().val();
	// cells $flatten\core.$shr$chip/src/uds_core.v:105$240 $flatten\core.$sub$chip/src/uds_core.v:105$239 $flatten\core.$ternary$chip/src/uds_core.v:104$238
	p_core_2e_off = shr_uu<7>(p_core_2e_up, sub_uu<3>(value<3>{0x7u}, p_core_2e_n__sweep.slice<2,0>().val()));
	// connection
	p_core_2e_n__pitch = p_core_2e_nw.slice<0>().concat(p_core_2e_nw.slice<1>()).concat(p_core_2e_nw.slice<2>()).concat(p_core_2e_nw.slice<3>()).concat(p_core_2e_nw.slice<4>()).concat(p_core_2e_nw.slice<5>()).concat(p_core_2e_nw.slice<6>()).concat(p_core_2e_nw.slice<7>()).val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:62.24-62.42
	// cell $flatten\core.$logic_and$chip/src/uds_core.v:62$228
	p_core_2e_fend = logic_and<1>(p_core_2e_wend, p_core_2e_v.curr);
	// cells $flatten\spi.$logic_and$chip/src/uds_spi.v:67$407 $flatten\spi.$eq$chip/src/uds_spi.v:67$406
	p_spi_2e_stop = logic_and<1>(p_spi_2e_cmd__end, eq_uu<1>(p_spi_2e_byte__in, value<8>{0x40u}));
	// connection
	i_flatten_5c_core_2e__24_1_5c_preset__ch_5b_2_3a_0_5d_ = i_procmux_24_518__Y;
	// cells $flatten\core.$ternary$chip/src/uds_core.v:321$372 $flatten\core.$ternary$chip/src/uds_core.v:322$371 $flatten\core.$ternary$chip/src/uds_core.v:323$370 $flatten\core.$logic_and$chip/src/uds_core.v:318$366 $flatten\core.$lt$chip/src/uds_core.v:318$365 $flatten\core.$add$chip/src/uds_core.v:316$362 $flatten\core.$logic_not$chip/src/uds_core.v:318$364
	p_core_2e_x = (p_core_2e_clearing.curr ? value<12>{0u} : (p_core_2e_w8 ? p_core_2e_src.concat(value<3>{0u}).val() : (p_core_2e_w1 ? p_core_2e_src.slice<8>().val().repeat<3>().concat(p_core_2e_src).val() : value<12>{0u})));
	// connection
	p_core_2e_n__ch = p_core_2e_nw.slice<30,28>().val();
	// connection
	p_core_2e_fold = xor_uu<9>(p_core_2e_n__ph.slice<8,0>().val(), p_core_2e_n__ph.slice<9>().val().repeat<9>().val());
	// cells $flatten\core.$add$chip/src/uds_core.v:106$241 $flatten\core.$shr$chip/src/uds_core.v:105$240 $flatten\core.$sub$chip/src/uds_core.v:105$239 $flatten\core.$ternary$chip/src/uds_core.v:104$238
	p_core_2e_pe__raw = add_uu<9>(value<1>{0u}.concat(p_core_2e_n__pitch).val(), value<2>{0u}.concat(p_core_2e_off).val());
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:213.35-213.63
	// cell $flatten\core.$ternary$chip/src/uds_core.v:213$383
	i_flatten_5c_core_2e__24_ternary_24_chip_2f_src_2f_uds__core_2e_v_3a_213_24_383__Y = (p_core_2e_act.slice<0>().val() ? shl_uu<8>(value<8>{0x1u}, p_core_2e_g__slot_5b_0_5d__2e_c) : value<8>{0u});
	// cells $procmux$491 $procmux$494 $procmux$497 $procmux$500 $procmux$503 $flatten\core.$lt$chip/src/uds_core.v:224$311
	p_core_2e_choice = (p_core_2e_same.slice<0>().val() ? value<1>{0u} : (p_core_2e_same.slice<1>().val() ? value<1>{0x1u} : (i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_377__Y ? (i_flatten_5c_core_2e__24_reduce__or_24_chip_2f_src_2f_uds__core_2e_v_3a_210_24_384__Y ? (i_flatten_5c_core_2e__24_lt_24_chip_2f_src_2f_uds__core_2e_v_3a_224_24_311__Y ? value<1>{0x1u} : value<1>{0u}) : value<1>{0x1u}) : value<1>{0u})));
	// connection
	p_core_2e_chbits.slice<15,8>() = (p_core_2e_act.slice<1>().val() ? shl_uu<8>(value<8>{0x1u}, p_core_2e_g__slot_5b_1_5d__2e_c) : value<8>{0u});
	// connection
	p_core_2e_chbits.slice<7,0>() = i_flatten_5c_core_2e__24_ternary_24_chip_2f_src_2f_uds__core_2e_v_3a_213_24_383__Y;
	// cells $flatten\spi.$logic_and$chip/src/uds_spi.v:66$405 $flatten\spi.$logic_and$chip/src/uds_spi.v:66$404 $flatten\spi.$eq$chip/src/uds_spi.v:66$403 $flatten\spi.$logic_and$chip/src/uds_spi.v:66$402 $flatten\spi.$eq$chip/src/uds_spi.v:66$401
	p_spi_2e_hit__done = logic_and<1>(logic_and<1>(logic_and<1>(p_spi_2e_rise, eq_uu<1>(p_spi_2e_bitcnt.curr, value<3>{0x7u})), eq_uu<1>(p_spi_2e_bytecnt.curr, value<2>{0x3u})), p_spi_2e_is__hit.curr);
	// connection
	p_spi_2e_idle = p_spi_2e_cs__s.curr.slice<1>().val();
	// connection
	p_core_2e_preset__ch = i_procmux_24_518__Y;
	// connection
	p_core_2e_preset = (eq_uu<1>(i_flatten_5c_core_2e__24_1_5c_preset__ch_5b_2_3a_0_5d_, value<3>{0x6u}) ? value<24>{0xff60fau} : (eq_uu<1>(i_flatten_5c_core_2e__24_1_5c_preset__ch_5b_2_3a_0_5d_, value<3>{0x5u}) ? value<24>{0xffb0fbu} : (eq_uu<1>(i_flatten_5c_core_2e__24_1_5c_preset__ch_5b_2_3a_0_5d_, value<3>{0x4u}) ? value<24>{0x14961fu} : (eq_uu<1>(i_flatten_5c_core_2e__24_1_5c_preset__ch_5b_2_3a_0_5d_, value<3>{0x3u}) ? value<24>{0x38952cu} : (eq_uu<1>(i_flatten_5c_core_2e__24_1_5c_preset__ch_5b_2_3a_0_5d_, value<3>{0x2u}) ? value<24>{0x46852cu} : (eq_uu<1>(i_flatten_5c_core_2e__24_1_5c_preset__ch_5b_2_3a_0_5d_, value<3>{0x1u}) ? value<24>{0x54852cu} : (logic_not<1>(i_flatten_5c_core_2e__24_1_5c_preset__ch_5b_2_3a_0_5d_) ? value<24>{0x5074bdu} : value<24>{0xff90fau})))))));
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:172.25-172.38
	// cell $flatten\core.$or$chip/src/uds_core.v:172$294
	p_core_2e_busy = or_uu<1>(p_core_2e_pend.curr, p_core_2e_commit.curr);
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:173.25-173.40
	// cell $flatten\core.$eq$chip/src/uds_core.v:173$295
	p_core_2e_frame__sync = not_u<1>(p_core_2e_v.curr);
	// \src: chip/src/project.v:43.5-61.4|chip/src/uds_spi.v:69.24-69.38
	// cell $flatten\spi.$and$chip/src/uds_spi.v:69$408
	p_spi_2e_miso = and_uu<1>(p_spi_2e_active, p_spi_2e_sr.curr.slice<7>().val());
	// cells $procmux$488 $procmux$485 $procmux$482 $procmux$456 $procmux$457_CMP0 $procmux$458_CMP0 $procmux$459_ANY $flatten\core.$ternary$chip/src/uds_core.v:179$302 $flatten\core.$logic_and$chip/src/uds_core.v:179$301 $flatten\core.$shiftx$chip/src/uds_core.v:0$300 $flatten\core.$logic_not$chip/src/uds_core.v:179$299 $flatten\core.$reduce_and$chip/src/uds_core.v:179$298 $flatten\core.$shiftx$chip/src/uds_core.v:0$297 $flatten\core.$eq$chip/src/uds_core.v:181$303 $procmux$479 $procmux$476 $procmux$473 $flatten\core.$logic_and$chip/src/uds_core.v:188$307 $flatten\core.$ternary$chip/src/uds_core.v:188$306 $flatten\core.$xor$chip/src/uds_core.v:147$266 $flatten\core.$xor$chip/src/uds_core.v:147$265 $flatten\core.$logic_not$chip/src/uds_core.v:188$305 $procmux$470 $procmux$467 $procmux$464 $procmux$461 $flatten\core.$eq$chip/src/uds_core.v:138$257 $flatten\core.$xor$chip/src/uds_core.v:155$276 $flatten\core.$xor$chip/src/uds_core.v:155$275
	p_core_2e_tail = (p_core_2e_clearing.curr ? value<1>{0u} : (p_core_2e_clearing.curr ? value<1>{0u} : (p_core_2e_committing ? p_core_2e_tail__commit : (p_core_2e_clearing.curr ? value<1>{0u} : (p_core_2e_committing ? value<1>{0u} : (p_core_2e_in__env ? logic_and<1>(logic_not<1>(p_core_2e_kill.curr), (p_core_2e_c__dec.curr ? p_core_2e_env__new : p_core_2e_head)) : (p_core_2e_clearing.curr ? value<1>{0u} : (p_core_2e_committing ? value<1>{0u} : (p_core_2e_in__env ? value<1>{0u} : (p_core_2e_in__phase ? i_flatten_5c_core_2e__24_xor_24_chip_2f_src_2f_uds__core_2e_v_3a_155_24_276__Y : p_core_2e_ring.curr.slice<95>().val()))))))))));
	// cells $procmux$685 $procmux$686_CMP0 $procmux$687_CMP0 $procmux$688_CMP0 $procmux$689_CMP0 $procmux$690_CMP0 $procmux$691_CMP0 $procmux$692_CMP0
	p_digit = (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x6u}) ? value<7>{0x7du} : (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x5u}) ? value<7>{0x6du} : (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x4u}) ? value<7>{0x66u} : (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x3u}) ? value<7>{0x4fu} : (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x2u}) ? value<7>{0x5bu} : (eq_uu<1>(p_spi_2e_ch.curr, value<3>{0x1u}) ? value<7>{0x6u} : (logic_not<1>(p_spi_2e_ch.curr) ? value<7>{0x3fu} : value<7>{0x7u})))))));
	// connection
	p_core_2e_status__next = or_uu<8>(i_flatten_5c_core_2e__24_ternary_24_chip_2f_src_2f_uds__core_2e_v_3a_213_24_383__Y, p_core_2e_chbits.slice<15,8>().val());
	// connection
	p_core_2e_best = (i_flatten_5c_core_2e__24_lt_24_chip_2f_src_2f_uds__core_2e_v_3a_224_24_311__Y ? p_core_2e_ring.curr.slice<23>().concat(p_core_2e_ring.curr.slice<24>()).concat(p_core_2e_ring.curr.slice<25>()).val() : p_core_2e_ring.curr.slice<71>().concat(p_core_2e_ring.curr.slice<72>()).concat(p_core_2e_ring.curr.slice<73>()).val());
	// connection
	p_core_2e_sum = add_uu<13>(value<1>{0u}.concat(p_core_2e_acc.curr).val(), value<1>{0u}.concat(not_u<1>(p_core_2e_x.slice<11>().val())).concat(p_core_2e_x.slice<10,0>()).val());
	// cells $flatten\core.$xor$chip/src/uds_core.v:155$276 $flatten\core.$xor$chip/src/uds_core.v:155$275
	p_core_2e_ph__new = i_flatten_5c_core_2e__24_xor_24_chip_2f_src_2f_uds__core_2e_v_3a_155_24_276__Y;
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:111.24-111.32
	// cell $flatten\core.$not$chip/src/uds_core.v:111$244
	p_core_2e_n__tri = not_u<1>(p_core_2e_fold.slice<8>().val()).concat(p_core_2e_fold.slice<7,0>()).val();
	// \src: chip/src/project.v:67.5-85.4|chip/src/uds_core.v:107.23-107.55
	// cell $flatten\core.$ternary$chip/src/uds_core.v:107$242
	p_core_2e_n__pe = (p_core_2e_pe__raw.slice<8>().val() ? value<8>{0xffu} : p_core_2e_pe__raw.slice<7,0>().val());
	// connection
	p_core_2e_n__bal = p_core_2e_nw.slice<24>().concat(p_core_2e_nw.slice<25>()).concat(p_core_2e_nw.slice<26>()).concat(p_core_2e_nw.slice<27>()).val();
	// connection
	p_spi_2e_cs__n__pin = p_uio__in.slice<0>().val();
	// connection
	p_spi_2e_sck__pin = p_uio__in.slice<3>().val();
	// connection
	p_spi_2e_mosi__pin = p_uio__in.slice<1>().val();
}

CXXRTL_EXTREMELY_COLD
void p_tt__um__ai__wrangler__uds1x1::debug_info(debug_items &items, std::string path) {
	assert(path.empty() || path[path.size() - 1] == ' ');
	items.add(path + "core clk", debug_item(debug_alias(), p_clk, 0));
	items.add(path + "core rst_n", debug_item(debug_alias(), p_rst__n, 0));
	items.add(path + "core hit_done", debug_item(debug_eval_outline, p_spi_2e_hit__done, 0));
	items.add(path + "core stop", debug_item(debug_eval_outline, p_spi_2e_stop, 0));
	items.add(path + "core hit_ch", debug_item(debug_alias(), p_spi_2e_ch, 0));
	items.add(path + "core payload_msb", debug_item(debug_eval_outline, p_spi_2e_payload__msb, 0));
	items.add(path + "core level", debug_item(debug_eval_outline, p_spi_2e_level, 0));
	items.add(path + "core spi_idle", debug_item(debug_eval_outline, p_spi_2e_idle, 0));
	items.add(path + "core commit_shift", debug_item(debug_eval_outline, p_core_2e_commit__shift, 0));
	static const value<1> const_p_core_2e_preset__load = value<1>{0u};
	items.add(path + "core preset_load", debug_item(const_p_core_2e_preset__load, 0));
	items.add(path + "core preset_ch", debug_item(debug_eval_outline, p_core_2e_preset__ch, 0));
	items.add(path + "core preset", debug_item(debug_eval_outline, p_core_2e_preset, 0));
	items.add(path + "core trig", debug_item(debug_alias(), p_ui__in, 0));
	items.add(path + "core status", debug_item(p_core_2e_status, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core audio", debug_item(p_core_2e_audio, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core busy", debug_item(debug_eval_outline, p_core_2e_busy, 0));
	items.add(path + "core frame_sync", debug_item(debug_eval_outline, p_core_2e_frame__sync, 0));
	items.add(path + "core t", debug_item(p_core_2e_t, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core v", debug_item(p_core_2e_v, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core frame", debug_item(p_core_2e_frame, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core clearing", debug_item(p_core_2e_clearing, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core wend", debug_item(debug_eval_outline, p_core_2e_wend, 0));
	items.add(path + "core fend", debug_item(debug_eval_outline, p_core_2e_fend, 0));
	items.add(path + "core ring", debug_item(p_core_2e_ring, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core tail", debug_item(debug_eval_outline, p_core_2e_tail, 0));
	items.add(path + "core head", debug_item(debug_eval_outline, p_core_2e_head, 0));
	items.add(path + "core nw", debug_item(debug_eval_outline, p_core_2e_nw, 0));
	items.add(path + "core n_pitch", debug_item(debug_eval_outline, p_core_2e_n__pitch, 0));
	items.add(path + "core n_sweep", debug_item(debug_eval_outline, p_core_2e_n__sweep, 0));
	items.add(path + "core n_bal", debug_item(debug_eval_outline, p_core_2e_n__bal, 0));
	items.add(path + "core n_env", debug_item(debug_eval_outline, p_core_2e_n__env, 0));
	items.add(path + "core n_ph", debug_item(debug_eval_outline, p_core_2e_n__ph, 0));
	items.add(path + "core n_ch", debug_item(debug_eval_outline, p_core_2e_n__ch, 0));
	items.add(path + "core up", debug_item(debug_eval_outline, p_core_2e_up, 0));
	items.add(path + "core off", debug_item(debug_eval_outline, p_core_2e_off, 0));
	items.add(path + "core pe_raw", debug_item(debug_eval_outline, p_core_2e_pe__raw, 0));
	items.add(path + "core n_pe", debug_item(debug_eval_outline, p_core_2e_n__pe, 0));
	items.add(path + "core fold", debug_item(debug_eval_outline, p_core_2e_fold, 0));
	items.add(path + "core n_tri", debug_item(debug_eval_outline, p_core_2e_n__tri, 0));
	items.add(path + "core c_tri", debug_item(p_core_2e_c__tri, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_env", debug_item(p_core_2e_c__env, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_bal", debug_item(p_core_2e_c__bal, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_metal", debug_item(p_core_2e_c__metal, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_pe", debug_item(p_core_2e_c__pe, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c_dec", debug_item(p_core_2e_c__dec, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core c0_decay", debug_item(debug_eval_outline, p_core_2e_c0__decay, 0));
	items.add(path + "core dmask", debug_item(debug_eval_outline, p_core_2e_dmask, 0));
	items.add(path + "core in_env", debug_item(debug_eval_outline, p_core_2e_in__env, 0));
	items.add(path + "core in_phase", debug_item(debug_eval_outline, p_core_2e_in__phase, 0));
	items.add(path + "core ej", debug_item(debug_eval_outline, p_core_2e_ej, 0));
	items.add(path + "core pj", debug_item(debug_eval_outline, p_core_2e_pj, 0));
	items.add(path + "core bor", debug_item(p_core_2e_bor, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core env_lt8", debug_item(debug_eval_outline, p_core_2e_env__lt8, 0));
	items.add(path + "core d_bit", debug_item(debug_eval_outline, p_core_2e_d__bit, 0));
	items.add(path + "core bor_in", debug_item(debug_eval_outline, p_core_2e_bor__in, 0));
	items.add(path + "core env_new", debug_item(debug_eval_outline, p_core_2e_env__new, 0));
	items.add(path + "core cy", debug_item(p_core_2e_cy, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core pk", debug_item(debug_eval_outline, p_core_2e_pk, 0));
	items.add(path + "core mant", debug_item(debug_eval_outline, p_core_2e_mant, 0));
	items.add(path + "core inc_bit", debug_item(debug_eval_outline, p_core_2e_inc__bit, 0));
	items.add(path + "core cy_in", debug_item(debug_eval_outline, p_core_2e_cy__in, 0));
	items.add(path + "core ph_new", debug_item(debug_eval_outline, p_core_2e_ph__new, 0));
	items.add(path + "core pend", debug_item(p_core_2e_pend, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core commit", debug_item(p_core_2e_commit, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core tgt", debug_item(p_core_2e_tgt, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core kill", debug_item(p_core_2e_kill, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core kill_pend", debug_item(p_core_2e_kill__pend, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core choice", debug_item(debug_eval_outline, p_core_2e_choice, 0));
	items.add(path + "core committing", debug_item(debug_eval_outline, p_core_2e_committing, 0));
	items.add(path + "core tail_commit", debug_item(debug_eval_outline, p_core_2e_tail__commit, 0));
	items.add(path + "core act", debug_item(debug_eval_outline, p_core_2e_act, 0));
	items.add(path + "core same", debug_item(debug_eval_outline, p_core_2e_same, 0));
	items.add(path + "core envhi", debug_item(debug_eval_outline, p_core_2e_envhi, 0));
	items.add(path + "core chbits", debug_item(debug_eval_outline, p_core_2e_chbits, 0));
	items.add(path + "core hgrp", debug_item(debug_eval_outline, p_core_2e_hgrp, 0));
	static const value<32> const_p_core_2e_i = value<32>{0x2u};
	items.add(path + "core i", debug_item(const_p_core_2e_i, 0));
	items.add(path + "core best", debug_item(debug_eval_outline, p_core_2e_best, 0));
	items.add(path + "core status_next", debug_item(debug_eval_outline, p_core_2e_status__next, 0));
	items.add(path + "core trig_s", debug_item(p_core_2e_trig__s, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core served", debug_item(p_core_2e_served, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core waiting", debug_item(debug_eval_outline, p_core_2e_waiting, 0));
	items.add(path + "core first", debug_item(debug_eval_outline, p_core_2e_first, 0));
	items.add(path + "core lfsr", debug_item(p_core_2e_lfsr, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core m3", debug_item(p_core_2e_m3, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core m5", debug_item(p_core_2e_m5, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core m7", debug_item(p_core_2e_m7, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core sq3", debug_item(p_core_2e_sq3, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core sq5", debug_item(p_core_2e_sq5, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core sq7", debug_item(p_core_2e_sq7, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core pc", debug_item(debug_eval_outline, p_core_2e_pc, 0));
	items.add(path + "core drum", debug_item(debug_eval_outline, p_core_2e_drum, 0));
	items.add(path + "core metal", debug_item(debug_eval_outline, p_core_2e_metal, 0));
	items.add(path + "core acc", debug_item(p_core_2e_acc, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "core q", debug_item(debug_eval_outline, p_core_2e_q, 0));
	items.add(path + "core qr", debug_item(debug_eval_outline, p_core_2e_qr, 0));
	items.add(path + "core w8", debug_item(debug_eval_outline, p_core_2e_w8, 0));
	items.add(path + "core w1", debug_item(debug_eval_outline, p_core_2e_w1, 0));
	items.add(path + "core sel_n", debug_item(debug_eval_outline, p_core_2e_sel__n, 0));
	items.add(path + "core src", debug_item(debug_eval_outline, p_core_2e_src, 0));
	items.add(path + "core x", debug_item(debug_eval_outline, p_core_2e_x, 0));
	items.add(path + "core sum", debug_item(debug_eval_outline, p_core_2e_sum, 0));
	items.add(path + "core g_slot[0].e", debug_item(debug_eval_outline, p_core_2e_g__slot_5b_0_5d__2e_e, 0));
	items.add(path + "core g_slot[0].c", debug_item(debug_eval_outline, p_core_2e_g__slot_5b_0_5d__2e_c, 0));
	items.add(path + "core g_slot[1].e", debug_item(debug_eval_outline, p_core_2e_g__slot_5b_1_5d__2e_e, 0));
	items.add(path + "core g_slot[1].c", debug_item(debug_eval_outline, p_core_2e_g__slot_5b_1_5d__2e_c, 0));
	items.add(path + "spi clk", debug_item(debug_alias(), p_clk, 0));
	items.add(path + "spi rst_n", debug_item(debug_alias(), p_rst__n, 0));
	items.add(path + "spi cs_n_pin", debug_item(debug_eval_outline, p_spi_2e_cs__n__pin, 0));
	items.add(path + "spi sck_pin", debug_item(debug_eval_outline, p_spi_2e_sck__pin, 0));
	items.add(path + "spi mosi_pin", debug_item(debug_eval_outline, p_spi_2e_mosi__pin, 0));
	items.add(path + "spi miso", debug_item(debug_eval_outline, p_spi_2e_miso, 0));
	items.add(path + "spi idle", debug_item(debug_eval_outline, p_spi_2e_idle, 0));
	items.add(path + "spi status", debug_item(debug_alias(), p_core_2e_status, 0));
	items.add(path + "spi hit_done", debug_item(debug_eval_outline, p_spi_2e_hit__done, 0));
	items.add(path + "spi stop", debug_item(debug_eval_outline, p_spi_2e_stop, 0));
	items.add(path + "spi ch", debug_item(p_spi_2e_ch, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi payload_msb", debug_item(debug_eval_outline, p_spi_2e_payload__msb, 0));
	items.add(path + "spi level", debug_item(debug_eval_outline, p_spi_2e_level, 0));
	items.add(path + "spi commit_shift", debug_item(debug_eval_outline, p_core_2e_commit__shift, 0));
	static const value<1> const_p_spi_2e_preset__load = value<1>{0u};
	items.add(path + "spi preset_load", debug_item(const_p_spi_2e_preset__load, 0));
	items.add(path + "spi preset_ch", debug_item(debug_eval_outline, p_core_2e_preset__ch, 0));
	items.add(path + "spi preset", debug_item(debug_eval_outline, p_core_2e_preset, 0));
	items.add(path + "spi cs_s", debug_item(p_spi_2e_cs__s, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi sck_s", debug_item(p_spi_2e_sck__s, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi mosi_s", debug_item(p_spi_2e_mosi__s, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi bitcnt", debug_item(p_spi_2e_bitcnt, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi bytecnt", debug_item(p_spi_2e_bytecnt, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi is_hit", debug_item(p_spi_2e_is__hit, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi sr", debug_item(p_spi_2e_sr, 0, debug_item::DRIVEN_SYNC));
	items.add(path + "spi active", debug_item(debug_eval_outline, p_spi_2e_active, 0));
	items.add(path + "spi rise", debug_item(debug_eval_outline, p_spi_2e_rise, 0));
	items.add(path + "spi byte_in", debug_item(debug_eval_outline, p_spi_2e_byte__in, 0));
	items.add(path + "spi cmd_end", debug_item(debug_eval_outline, p_spi_2e_cmd__end, 0));
	items.add(path + "spi read_cmd", debug_item(debug_eval_outline, p_spi_2e_read__cmd, 0));
	items.add(path + "spi read_value", debug_item(debug_eval_outline, p_spi_2e_read__value, 0));
	static const value<1> const_p___unused = value<1>{0u};
	items.add(path + "_unused", debug_item(const_p___unused, 0));
	items.add(path + "digit", debug_item(debug_eval_outline, p_digit, 0));
	items.add(path + "frame_sync", debug_item(debug_eval_outline, p_core_2e_frame__sync, 0));
	items.add(path + "busy", debug_item(debug_eval_outline, p_core_2e_busy, 0));
	items.add(path + "audio", debug_item(debug_alias(), p_core_2e_audio, 0));
	items.add(path + "status", debug_item(debug_alias(), p_core_2e_status, 0));
	items.add(path + "preset", debug_item(debug_eval_outline, p_core_2e_preset, 0));
	items.add(path + "level", debug_item(debug_eval_outline, p_spi_2e_level, 0));
	items.add(path + "preset_ch", debug_item(debug_eval_outline, p_core_2e_preset__ch, 0));
	items.add(path + "hit_ch", debug_item(debug_alias(), p_spi_2e_ch, 0));
	static const value<1> const_p_preset__load = value<1>{0u};
	items.add(path + "preset_load", debug_item(const_p_preset__load, 0));
	items.add(path + "commit_shift", debug_item(debug_eval_outline, p_core_2e_commit__shift, 0));
	items.add(path + "payload_msb", debug_item(debug_eval_outline, p_spi_2e_payload__msb, 0));
	items.add(path + "stop", debug_item(debug_eval_outline, p_spi_2e_stop, 0));
	items.add(path + "hit_done", debug_item(debug_eval_outline, p_spi_2e_hit__done, 0));
	items.add(path + "spi_idle", debug_item(debug_eval_outline, p_spi_2e_idle, 0));
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
	return new _cxxrtl_toplevel { std::unique_ptr<cxxrtl_design::p_tt__um__ai__wrangler__uds1x1>(new cxxrtl_design::p_tt__um__ai__wrangler__uds1x1) };
}

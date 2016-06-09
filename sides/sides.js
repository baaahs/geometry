
var util = require("util");

var packing = `
R7D: -5.956042006675858,37.68155306841999 22.200321914332108,5.207806152002377 -22.200318519220787,-37.68155690415756 -5.956042006675858,37.68155306841999
R6D: 13.54547663705182,33.69243430423347 11.166707864208604,-33.69242003140951 -13.545477894312597,1.473372197404501 13.54547663705182,33.69243430423347
R5D: 2.7231480039874327,30.553458716634253 11.28777204327605,4.975869515148872 -11.287768815294669,-30.553452676630002 2.7231480039874327,30.553458716634253
R3D: 10.952069422789691,22.041603383389926 -10.952071695985524,-0.16465416846626368 4.8265484353574095,-22.04160553388874 10.952069422789691,22.041603383389926
R4D: 12.361338934793025,50.23966086486405 -12.36133554032051,13.23100400448071 10.395012111858875,-50.23966462476678 12.361338934793025,50.23966086486405
R7P: 17.872335794571796,38.48770234143305 13.598813168471139,-38.48769547188806 -17.872336888886252,14.620503124986072 17.872335794571796,38.48770234143305
R4P: -13.350211895987059,50.11167324513613 -5.917662805672421,-50.11167378999225 13.35023269958566,14.503534005901614 -13.350211895987059,50.11167324513613
R3P: -15.366350969666826,16.151718556052828 15.24967462609419,-16.151722412390058 15.366340617693567,10.821453158063633 -15.366350969666826,16.151718556052828
R5P: -0.17590519865493093,30.91179583139069 10.226234527451368,-30.911781766000217 -10.226223327842206,5.880676862989674 -0.17590519865493093,30.91179583139069
R6P: 11.542474720512075,29.958068255914355 19.38381293205495,-11.400140836605686 -19.3838111857946,-29.958054079808704 11.542474720512075,29.958068255914355
R1: 25.38617642501572,38.38300354403043 -27.1112750447584,-38.38298943378766 27.11127667105484,-23.976164222565217 25.38617642501572,38.38300354403043
R2D: -27.973801075360086,16.772758735489674 27.97380774650952,-31.179573103785884 27.111290316518648,-0.000007098248715919908 26.24875373717157,31.179572291677545 -27.973801075360086,16.772758735489674
R2P: -32.48972957123425,31.179582876094017 -30.764643963837784,-31.179585295462175 -20.763284397471978,-26.81344600155785 5.863197131482195,-15.189565226583056 32.48971696111411,-3.565710066378813 -32.48972957123425,31.179582876094017
F15: -25.200000762939457,-21.704765319824247 -22.099319458007816,21.70476531982419 -10.797968387603767,5.722251892089815 10.797971248626695,5.722251892089815 22.099317073822007,21.70476531982419 25.20000076293944,-21.704765319824247 -25.200000762939457,-21.704765319824247
F14D: -16.322826817680607,12.528534815141597 -13.205179465859267,17.59917169746649 -2.0328160994821474,30.022631829310654 2.3701555406153716,30.96951221826592 16.32282545960527,4.413966644244539 -14.936257277749178,-30.969499791093668 -16.322826817680607,12.528534815141597
F14P: -16.706207803545546,7.968738075925472 -0.494629814446931,31.10191209739935 3.9017086066059896,28.204022774806816 14.258553287992463,17.29270974017865 16.706208709658803,11.866841363819844 9.80049459712184,-31.10189945442184 -16.706207803545546,7.968738075925472
F13P: -6.859259577311474,27.56573462943794 -6.859258707748744,-30.034279103472215 6.859259568254175,-5.340934706339681 2.1432787692630733,-2.6731720465637636 2.1432787979436583,27.362144420721364 5.483424784141543,30.03427125913896 -6.859259577311474,27.56573462943794
F13D: -2.2789854787012587,-2.2246938245728813 -7.28413033575967,-3.8113873156098066 7.2841364766413506,-30.034270465350005 7.284131691590602,27.565743267558503 -5.058551816493647,30.034277965219815 -2.278991043371505,27.810622642710115 -2.2789854787012587,-2.2246938245728813
F12P: 15.679848954723013,10.794519458313516 -15.679862091405113,10.810967996402155 13.990534170161425,-10.810956898252158 15.679848954723013,10.794519458313516
F11: 2.8911433900167367,-22.529890346561572 -22.47036812149139,3.019938523889607 -13.035757543407556,22.52989793633752 22.470361089520793,-13.23986196604072 2.8911433900167367,-22.529890346561572
F12D: 0.6336758084019323,13.391449774471937 -16.94647733451349,0.7190936988600356 16.946480061901497,-13.391455094161472 0.6336758084019323,13.391449774471937
F16P: -11.30129861831665,28.800003051757812 28.79999816417694,28.800003051757812 28.79999828338623,-28.800010681152344 -28.800001621246338,6.845123291015625 -11.30129861831665,28.800003051757812
F16D: -28.79999828338623,-28.800010681152344 -28.79999828338623,28.800003051757812 -21.003600597381592,27.799728393554688 15.869043827056885,23.069046020507812 28.800001621246338,6.845123291015625 -28.79999828338623,-28.800010681152344
F17D: -28.79999828338623,15.273503509202186 28.800001621246352,15.27351160139662 -21.70691204071045,-15.2735045827407 -28.79999828338623,15.273503509202186
F20D: 19.095305800543507,-16.414223395788582 19.002757063795606,-16.88320436720622 -17.86988724596835,-12.15252110034666 -25.666285265757573,-11.152249043775555 25.666283867585868,16.88319249958468 19.095305800543507,-16.414223395788582
F20P: -25.253465020012186,15.273476369356558 14.847831762471117,15.27350296573755 22.218489660594607,-6.36396689733769 25.253468686103304,-15.273501165819141 -25.253465020012186,15.273476369356558
F17P: -28.79999828338623,-15.273512200322642 -21.70691192150116,15.27349867331074 28.800001621246338,-15.273512200322642 -28.79999828338623,-15.273512200322642
F18D: -10.758723115022448,-5.610873970272792 -4.3240822066096385,-21.915937139582468 10.758719763660181,21.915922861191945 -10.459870537458592,-5.22855343490636 -10.758723115022448,-5.610873970272792
F19D: -14.346543342536563,24.56567183829665 -14.250027056048093,-24.565683465452153 14.346543637702169,-11.434335127227314 -14.346543342536563,24.56567183829665
F18P: -15.077147455272097,3.2551489905691113 -23.936037132665632,0.0753734874382701 23.936026355889112,-10.977444017805425 6.43733298604451,10.977443420792767 -15.077147455272097,3.2551489905691113
F19P: -23.93602797072839,18.00000181803381 4.757063031251903,-18.000001942040896 23.93603915306946,6.94720005780043 -23.93602797072839,18.00000181803381
1D: 26.81248855722106,-8.489150476821933 -26.8124810746705,-35.187250538861406 -4.424554803013805,35.187251147219825 26.81248855722106,-8.489150476821933
2D: 26.692296199698262,21.713092915632842 24.150204946042464,-21.713100328460683 -26.692297923432818,-5.462466420883445 26.692296199698262,21.713092915632842
3D: -26.164706178973177,35.539902379153375 12.527391759497078,-35.539898891858705 26.164712507591986,25.019677079433563 -26.164706178973177,35.539902379153375
5D: 34.49332894720794,37.72991142043452 -12.543736094587253,-37.72990570897151 -34.493326482256336,11.276185043126944 34.49332894720794,37.72991142043452
6D: 22.384262351455746,38.41370015900402 15.135685537188294,-29.638692445313502 -22.38425537635412,-38.413699311525015 22.384262351455746,38.41370015900402
7D: -33.8407706618309,17.32559585571289 3.679170608520508,26.100601196289062 36.382856369018555,-6.60308837890625 -36.38286203145981,-26.100597381591797 -33.8407706618309,17.32559585571289
8D: 38.56792417821515,39.3526587311508 -14.535310682469841,-28.761517967401915 -38.56792018647599,-39.35265225031369 -33.030443455209166,22.183441339996747 38.56792417821515,39.3526587311508
10D: -4.1877392300646505,15.842417481556993 26.816446919241628,6.457319009028339 15.285596895102586,-15.746777063986087 -17.462692828880144,-15.842414814527274 -26.816446770539038,2.526264771819001 -4.1877392300646505,15.842417481556993
12D: 15.453754501098246,4.928493853465341 -15.45376618557765,-34.16810203119918 -11.734588992825053,34.168108911561006 15.453754501098246,4.928493853465341
13D: 16.97664918098198,34.593230144116745 15.72703442048308,-34.59322276640658 -16.97665139620341,-1.8895332473997115 16.97664918098198,34.593230144116745
9D: 25.741000741743534,38.52336360263462 7.056146960901053,-38.52337038552311 -25.740997276639362,-32.59872893940536 25.741000741743534,38.52336360263462
15D: -24.321777988760978,14.87250629679091 21.277196666799156,-38.74815294297044 24.321781367471004,-10.291531664125849 -6.126768980147958,38.74814957741749 -24.321777988760978,14.87250629679091
16D: 23.47266508657006,-18.179216366849104 -23.472662641256818,34.59877795850588 -23.316815106067367,-34.59878352262939 23.47266508657006,-18.179216366849104
17D: 40.364017486572266,-21.324840545654297 6.425472259521484,21.324848175048828 -40.3640079498291,4.905281066894531 40.364017486572266,-21.324840545654297
18D: 40.36400799539362,18.1979382583131 -40.36401727676815,44.428060376339516 -6.177747862683589,-44.42806279022879 40.36400799539362,18.1979382583131
14D: 29.607843356814584,-43.72819870211805 -8.015157656494438,43.72819863619716 -29.607836248457318,-32.55469073145585 29.607843356814584,-43.72819870211805
20D: 47.62498879397023,19.05253201710221 -47.624976848146844,-19.0525312036564 -44.99156924375711,10.051640072912804 47.62498879397023,19.05253201710221
21D: -47.89443451007429,3.0153951041797598 47.89444166632907,39.142386663095735 28.751605994042393,14.773247133035682 5.360772362066172,-15.410966551728606 -13.690329466263535,-39.14238500223641 -47.89443451007429,3.0153951041797598
23D: 35.141543232329724,-19.95336647452791 -35.14153203884547,-33.09611171521938 6.17118281043912,33.0961131867019 35.141543232329724,-19.95336647452791
22D: 17.69048564020318,-36.72249671812732 1.7418950717328983,36.72248411963204 -17.69048089076324,12.284811743326884 17.69048564020318,-36.72249671812732
24D: 17.844617805404937,-28.714595082553814 36.54450009187974,28.714593341625886 -36.544502582362696,11.881316130750733 17.844617805404937,-28.714595082553814
25D: 30.967807306062184,-17.184785821370923 -27.55516136145195,17.184772833560174 -30.96779156648512,-4.356489854626091 30.967807306062184,-17.184785821370923
26D: -32.68882222241075,0.19276822501221602 18.34575489212125,-26.10876664695374 32.688825316922646,12.765133279587957 -29.09322959032147,26.10876359961719 -32.68882222241075,0.19276822501221602
27D: 26.180719048282242,6.8769234825641945 -26.180707230513747,30.65408874927229 15.761493206470675,-30.65410395813869 26.180719048282242,6.8769234825641945
28D: 30.746627620977563,-30.654099337988818 -11.195572403957726,30.65409365131356 -30.74661522184377,6.5862719438156745 30.746627620977563,-30.654099337988818
29D: 43.222105814305394,-18.330400272177744 -18.61841214946756,18.330403135618795 -43.222115105169365,-11.858135775830348 43.222105814305394,-18.330400272177744
30D: 43.007025930769544,15.423682694066244 -43.00703003211797,26.197526710891864 34.18656815432038,-26.197521614773066 43.007025930769544,15.423682694066244
31D: 36.582049731758616,-20.39820029846902 -36.582044494995074,37.490555138116235 -31.448310912826486,-37.490559356714144 36.582049731758616,-20.39820029846902
32D: 26.080139514371638,-36.09092196588391 -2.315513695540318,36.09092175031638 -26.080144264289515,-19.43420422449597 26.080139514371638,-36.09092196588391
35D: 26.00417593603197,3.982110198182127 -26.004180534637555,21.10730529215104 -2.990864596065819,-21.10730536519494 26.00417593603197,3.982110198182127
36D: 13.117346891740112,-19.757908134258173 -13.117322882258009,20.53387968024697 -7.53398974456104,-20.533875673305374 13.117346891740112,-19.757908134258173
33D: 11.606191654346105,-20.119927769843628 -11.606195996457757,-19.26556949114685 1.6820578772416184,20.119924460002892 11.606191654346105,-20.119927769843628
34D: -13.451896431167825,7.09370450054476 -1.8970904857317237,43.965160078942404 20.966275623582646,45.62321801040464 -4.7878798427942115,-45.62321781757061 -20.96629071653001,-34.21689404413297 -13.451896431167825,7.09370450054476
37D: -10.99642837938569,-55.77074434053583 -20.021301037342823,-38.10895450338106 -0.6174324345279842,54.900897261543236 20.021298894174947,55.77074421407522 15.689453483934471,-41.51908205361849 -10.99642837938569,-55.77074434053583
43D: 17.694343114096114,-53.74770456433903 -16.320167241127535,53.74770107651426 -17.694343785223793,-43.78762949943359 17.694343114096114,-53.74770456433903
38D: -3.35926530455356,14.7264073866519 30.42403279107316,1.9691521651845676 24.285477426359307,-12.367061287336739 -23.298012464515352,-14.726407121132226 -30.424031644756155,-0.41953068761998225 -3.35926530455356,14.7264073866519
39D: 29.41692569478022,-8.337216956134 -29.416920930690424,36.026501924946714 -0.6959147628810456,-36.02650278822396 29.41692569478022,-8.337216956134
40D: 18.577777650058977,30.62594956856296 5.214948850044891,-30.62595012934524 -18.5777792239831,13.51033378356658 18.577777650058977,30.62594956856296
41D: 5.632591569817492,22.23711140743154 -28.787497744922973,5.3418872202503564 28.78748721996567,-22.237108926111716 5.632591569817492,22.23711140743154
42D: -28.70925713502129,51.90850157878481 15.271168369125917,-51.908507244776345 28.709261322088707,24.005210368988102 -28.70925713502129,51.90850157878481
4D: -34.0631296812434,-19.916517325360644 4.93454397232685,19.91651609090877 34.063129261054115,8.680180195788907 -34.0631296812434,-19.916517325360644
11D: 2.3768910879599616,-17.11336164376695 18.18259679943023,9.38369989759066 -18.1825960186043,17.113361842482632 2.3768910879599616,-17.11336164376695
1P: -23.912962479099185,-0.5716495642917181 14.79733244465585,36.6425144546634 23.912960787358656,-36.6425119249559 -23.912962479099185,-0.5716495642917181
2P: -23.653567770440134,21.71309386957084 26.1956579009409,-11.505586834135897 -26.19565836587057,-21.71309941305401 -23.653567770440134,21.71309386957084
3P: 12.18657577065693,40.064352581391304 -23.53590392158084,0.4039469120654573 23.53590882461868,-40.06435183888118 12.18657577065693,40.064352581391304
4P: 13.46436862348547,-11.940205007212228 -36.90640069055878,11.940209702167124 36.90640648799513,8.680184700620387 13.46436862348547,-11.940205007212228
5P: 35.09725696189217,-36.53822998464997 -35.097260676744604,-13.479870110881748 -15.563395247093034,36.538226131765384 35.09725696189217,-36.53822998464997
6P: 37.09872852463758,-28.88957705148414 -37.09873155517724,20.11457622635968 0.4212109671029225,28.88957621396913 37.09872852463758,-28.88957705148414
7P: -36.382856369018555,-6.60308837890625 -3.679170608520508,26.100601196289062 33.8407706618309,17.32559585571289 36.38286203145981,-26.100597381591797 -36.382856369018555,-6.60308837890625
8P: 4.492759386838507,-53.29054615314206 -25.85846057275213,11.808043732639078 20.255172625863075,53.290553778937166 25.85846246545458,27.124244119636586 4.492759386838507,-53.29054615314206
12P: 19.71702884699934,19.30956817230446 29.852302075565603,-19.30956774649968 -29.85230188487489,14.142354652414163 19.71702884699934,19.30956817230446
13P: -34.593230054971684,-16.97664909183692 1.8895333365447726,16.976651485348476 34.593222855551645,-15.727034331338018 -34.593230054971684,-16.97664909183692
9P: 40.887248688232376,15.346857795355 -40.887249549120334,-16.61686547888941 -38.38260782551792,16.616866523322322 40.887248688232376,15.346857795355
15P: 18.32061750874429,-10.624825660536146 39.52184463069175,7.787141494346486 -30.322947765147106,14.539200861194956 -39.521844631448474,-14.53919631005732 18.32061750874429,-10.624825660536146
16P: 23.394746433047686,35.270071502781434 -23.394731827497026,18.85049884127752 19.72476181331237,-35.27007092244466 23.394746433047686,35.270071502781434
17P: -40.364017486572266,-21.324840545654297 40.3640079498291,4.905281066894531 -6.425472259521484,21.324848175048828 -40.364017486572266,-21.324840545654297
18P: 40.3640103406176,-39.01102948376496 39.52158184918214,39.01102739710464 -40.36401192498684,-12.78089811250723 40.3640103406176,-39.01102948376496
14P: 23.91838575268332,47.596270225642456 -25.496909587758793,13.107542666770495 25.496914461639022,-47.596270909468146 23.91838575268332,47.596270225642456
20P: 39.98999378733538,-37.509329384562534 -39.989988006023424,10.051635606495921 -29.986820356466538,37.509316832003464 39.98999378733538,-37.509329384562534
21P: -11.014565225853346,-40.41530286277164 25.50748171592278,14.991274925114737 42.26610499825014,40.41530283488552 -42.26609063524205,0.22644176042172148 -11.014565225853346,-40.41530286277164
23P: 31.741992019742213,30.179243559960952 34.964127806114334,-30.179243136407283 -34.96413984914429,4.4356153555660285 31.741992019742213,30.179243559960952
27P: -17.784664373586338,-26.76470858691343 20.9711113311468,-30.654095696161676 -20.971104878753493,30.654086220668887 -17.784664373586338,-26.76470858691343
28P: 20.971111722082867,-35.434143706576606 8.869083379015137,35.43413972125393 -20.971100141187208,25.87405162272978 20.971111722082867,-35.434143706576606
29P: -3.7674545365014183,-40.51837329998904 15.869546818760597,40.51836016103198 -15.86954089673668,30.349887317479983 -3.7674545365014183,-40.51837329998904
30P: -35.80044367721655,20.81059994134972 -44.620910647983635,-20.81060403584729 44.620924065059256,-1.2113800495766043 -35.80044367721655,20.81059994134972
31P: 44.44067284466192,-11.296584005165585 -10.374577763094521,32.47059467861507 -44.4406860856173,-32.470593510239155 44.44067284466192,-11.296584005165585
22P: -30.621252808037056,-20.169362238752882 29.581859668025032,-14.77359320217414 30.621252856455783,20.16936802828144 -30.621252808037056,-20.169362238752882
24P: -22.748564318351015,-24.894379670312446 22.748564060023995,14.827263882490854 -20.031757433984467,24.8943670615497 -22.748564318351015,-24.894379670312446
32P: 38.18246096695049,-11.060095920531637 -3.317996187544267,24.65901724903597 -38.18246214933208,-24.65899842894646 38.18246096695049,-11.060095920531637
39P: 31.336390698484138,-20.18033721803681 38.00705856595559,20.18031457469067 -38.00705373729801,4.740548943779004 31.336390698484138,-20.18033721803681
40P: -18.548813600081473,30.64830801459499 18.548813573903004,13.407482019537213 -5.392643041383053,-30.648302283630542 -18.548813600081473,30.64830801459499
35P: 15.438488339277512,-18.971888728235967 24.038266983189473,18.394338598073602 -24.03826901277428,18.971867261645457 15.438488339277512,-18.971888728235967
41P: -2.757629108249148,21.065393936090857 -29.944051249209423,-21.06540152996186 29.94403930950847,1.0456032273755227 -2.757629108249148,21.065393936090857
36P: 11.568523098557876,21.07346808525554 -9.082812746169338,20.29747947981511 -11.568510324103386,-21.073471745853766 11.568523098557876,21.07346808525554
33P: -19.52093474894349,2.4921750161798286 19.52093242887193,16.401413134619418 -6.008827685469328,-16.4014337419369 -19.52093474894349,2.4921750161798286
34P: -33.6385166561314,34.085815558242 -11.583190165927078,41.04119374643016 13.473515945074666,11.22849913305285 33.638490777327576,-24.930032569049267 24.586958443834163,-41.04119695608 -33.6385166561314,34.085815558242
37P: -41.85058392924793,40.992533524682216 -11.07805364088398,39.433181915324596 41.85059142911251,-31.74953048561288 23.664170693805886,-40.992536330749104 -40.14561301292895,20.24206876337996 -41.85058392924793,40.992533524682216
43P: -54.844064787274334,17.284441080613817 -42.33187307472812,-17.284436747645827 54.844062020274535,-8.807013191777287 -54.844064787274334,17.284441080613817
42P: 30.28433356247868,48.59516379279518 -30.28433340397646,28.422992267279113 -26.86711407850271,-48.595171020587244 30.28433356247868,48.59516379279518
10P: -18.17112338484113,15.159512518525847 14.560218040962326,16.20289033967476 26.867843872600105,-5.029809683372704 -3.7687052246427513,-16.20289047176717 -26.86784745747923,-3.212578435644204 -18.17112338484113,15.159512518525847
11P: -18.18259748548969,-7.587863591119742 18.18259875866893,-15.317517046757573 14.520692286505792,15.317512647258226 -18.18259748548969,-7.587863591119742
38P: -23.74824591134518,14.529262063681962 23.883278538367733,13.69938124642351 30.44554640069407,-0.09655062416983995 -2.9282298539395697,-14.529260316931037 -30.44556840078303,0.3730705604197624 -23.74824591134518,14.529262063681962
26P: 19.724417356891763,32.478324107573314 5.132313732200686,-32.4783539179642 -19.724416583598796,19.379281568585213 19.724417356891763,32.478324107573314
25BP: -5.242685251606304,36.68215710688963 -23.42250741052132,-36.68218756231988 23.422506601475874,-35.03601820225387 -5.242685251606304,36.68215710688963
19BP: 56.02840455561639,-14.323485931220091 -22.632430192410837,14.323477095119344 -56.028416904066404,-13.510634355621704 56.02840455561639,-14.323485931220091
19AP: 51.51628646319409,10.217973141713955 -51.51629217965507,-43.67283232279635 18.68432628421641,43.6728323127261 51.51628646319409,10.217973141713955
25AP: 35.79041188104901,17.237583813516636 -35.79040471438992,-11.768908376632652 8.533025204300031,-17.237586165799286 35.79041188104901,17.237583813516636
F3D: 33.80477895430067,34.6204381736807 8.124234824374696,-34.6204412509793 -33.804772128588,4.306090315767776 33.80477895430067,34.6204381736807
F2D: 36.23523348760142,1.7771509645289143 -36.235230484029586,-13.651484435452943 2.2831790185477416,13.651483900486028 36.23523348760142,1.7771509645289143
F1D: -26.634924102179184,1.367002667003078 26.634925956821746,24.130275559250165 -1.2650467347150425,-24.13027380918838 -26.634924102179184,1.367002667003078
F4D: -6.946008854684436,0.0000054005611929142106 13.545244769020798,-22.10795306102949 27.43726056738332,5.91835729067742 -27.4372634853581,22.10795561378788 -6.946008854684436,0.0000054005611929142106
F10D: 2.509755351013144,11.608735871314963 -22.623859138484896,-11.608736045080022 22.623859010846715,-10.842896874013036 2.509755351013144,11.608735871314963
F5D: -7.021651455096517,38.45807319466144 -18.040578847376622,9.182735212055547 18.04057265908645,-38.458065987825485 -7.021651455096517,38.45807319466144
F6D: 2.907192059380847,-38.39122562627282 21.920251463731773,-29.47473908145472 -21.920251621160958,38.55045390518991 2.5676766568847853,-38.55044695166466 2.907192059380847,-38.39122562627282
F7D: 10.056004942636406,-6.354489256871929 7.183360001994657,13.987408873854207 -9.753559361303772,4.55850583017461 -10.056001218365338,4.390134304903995 -3.654832051334111,-13.987409381884966 10.056004942636406,-6.354489256871929
F10P: -22.572639861884653,6.960976387287587 -25.133610542806416,-23.217471342366366 -0.000003911139884849035,0.0000056511249226787186 25.13361044747204,23.217477709207998 -22.572639861884653,6.960976387287587
F4P: -16.338174250252308,-17.455731624571186 12.220805596775204,-30.216871641449693 14.279487622038165,0.0000018765229299333441 16.338175281873813,30.21686940641817 -16.338174250252308,-17.455731624571186
F3P: -23.897753207858784,36.88737668757486 27.22568237951822,-17.510343734379646 -27.225682999240362,-36.88737952921933 -23.897753207858784,36.88737668757486
F2P: -15.078107343282284,34.1442582526837 14.940370568792702,13.06909894063429 15.07810796789748,-34.144257406846705 -15.078107343282284,34.1442582526837
F1P: -1.04700238950781,-24.13559233630567 -26.83455512507213,1.94646049886002 26.83455958997729,24.135590677628556 -1.04700238950781,-24.13559233630567
`

var panels = [];

packing.split("\n").forEach(function( line ) {
	line = line.trim();

	if (!line) return;

	var colon = line.split(":")
	if (colon.length < 2) return;

	var name = colon[0]

	var spaces = colon[1].trim().split(" ")
	var pts = []
	spaces.forEach(function(pair) {
		if (!pair) return;
		var p = pair.split(",");
		pts.push([parseFloat(p[0]), parseFloat(p[1])])
	});

	panels.push({
		name: name
		, pts: pts
	})
});


// Calculate the length of each side ( presuming these number are in feet maybe??? )

panels.forEach(function(panel) {
	var sides = [];

	var pts = panel.pts;
	for (var ix = 0; ix<pts.length-1; ix++) {
		var distance = Math.sqrt( Math.pow(pts[ix][0] - pts[ix+1][0], 2) +
			 Math.pow(pts[ix][0] - pts[ix+1][0], 2) )
		sides.push(distance);
	}

	panel.sides = sides;

	// console.log(panel.name, util.inspect(panel.sides));
})

console.log(util.inspect(panels, {depth: 5}));

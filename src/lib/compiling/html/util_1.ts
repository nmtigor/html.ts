/** 80**************************************************************************
 * @module lib/compiling/html/util_1
 * @license MIT
 ******************************************************************************/

import { INOUT } from "@fe-src/preNs.ts";
import { assert } from "../../util.ts";
import type { HTMLTk } from "./HTMLTk.ts";
import { HTMLTok } from "./HTMLTok.ts";
import { Colgroup_El } from "./stnode/Colgroup_El.ts";
import { Unknown_El } from "./stnode/CtnrEl.ts";
import type { Elment } from "./stnode/Elment.ts";
import {
  A_SVG,
  Abbr_El,
  Animate_SVG,
  AnimateMotion_SVG,
  AnimateTransform_SVG,
  Annotation_MathML,
  Audio_El,
  Bdi_El,
  Bdo_El,
  Canvas_El,
  Circle_SVG,
  Cite_El,
  ClipPath_SVG,
  Data_El,
  Defs_SVG,
  Dfn_El,
  Dialog_El,
  Ellipse_SVG,
  Error_MathML,
  FeBlend_SVG,
  FeColorMatrix_SVG,
  FeComponentTransfer_SVG,
  FeComposite_SVG,
  FeConvolveMatrix_SVG,
  FeDiffuseLighting_SVG,
  FeDisplacementMap_SVG,
  FeDistantLight_SVG,
  FeDropShadow_SVG,
  FeFlood_SVG,
  FeFuncA_SVG,
  FeFuncB_SVG,
  FeFuncG_SVG,
  FeFuncR_SVG,
  FeGaussianBlur_SVG,
  FeImage_SVG,
  FeMerge_SVG,
  FeMergeNode_SVG,
  FeMorphology_SVG,
  FeOffset_SVG,
  FePointLight_SVG,
  FeSpecularLighting_SVG,
  FeSpotLight_SVG,
  FeTile_SVG,
  FeTurbulence_SVG,
  Filter_SVG,
  Frac_MathML,
  G_SVG,
  Image_SVG,
  Kbd_El,
  Label_El,
  Legend_El,
  Line_SVG,
  LinearGradient_SVG,
  Map_El,
  Mark_El,
  Marker_SVG,
  Mask_SVG,
  Math_MathML,
  Metadata_SVG,
  Meter_El,
  Mpath_SVG,
  Multiscripts_MathML,
  Optgroup_El,
  Option_El,
  Output_El,
  Over_MathML,
  Padded_MathML,
  Path_SVG,
  Pattern_SVG,
  Phantom_MathML,
  Picture_El,
  Polygon_SVG,
  Polyline_SVG,
  Prescripts_MathML,
  Progress_El,
  Q_El,
  RadialGradient_SVG,
  Rect_SVG,
  Root_MathML,
  Row_MathML,
  Rp_El,
  Rt_El,
  Samp_El,
  Script_SVG,
  Selectedcontent_El,
  Semantics_MathML,
  Set_SVG,
  Slot_El,
  Space_MathML,
  Span_El,
  Sqrt_MathML,
  Stop_SVG,
  Style_MathML,
  Style_SVG,
  Sub_El,
  Sub_MathML,
  Subsup_MathML,
  Sup_El,
  Sup_MathML,
  Svg_SVG,
  Switch_SVG,
  Symbol_SVG,
  Table_MathML,
  Td_MathML,
  Text_SVG,
  TextPath_SVG,
  Time_El,
  Tr_MathML,
  Tspan_SVG,
  Under_MathML,
  Underover_MathML,
  Use_SVG,
  Var_El,
  Video_El,
  View_SVG,
} from "./stnode/OrdinaryCtnrEl.ts";
import { P_El } from "./stnode/P_El.ts";
import {
  Address_El,
  AnnotationXml_MathML,
  Article_El,
  Aside_El,
  Blockquote_El,
  Button_El,
  Caption_El,
  Code_El,
  Dd_El,
  Del_El,
  Desc_SVG,
  Details_El,
  Div_El,
  Dl_El,
  Dt_El,
  Fieldset_El,
  Figcaption_El,
  Figure_El,
  Footer_El,
  ForeignObject_SVG,
  Form_El,
  H1_El,
  H2_El,
  H3_El,
  H4_El,
  H5_El,
  H6_El,
  Header_El,
  Hgroup_El,
  I_MathML,
  Iframe_El,
  Ins_El,
  Li_El,
  Main_El,
  Menu_El,
  N_MathML,
  Nav_El,
  Noscript_El,
  O_MathML,
  Object_El,
  Ol_El,
  Pre_El,
  S_MathML,
  Script_El,
  Search_El,
  Section_El,
  Select_El,
  Style_El,
  Summary_El,
  Table_El,
  Td_El,
  Template_El,
  Text_MathML,
  Textarea_El,
  Tfoot_El,
  Th_El,
  Thead_El,
  Title_El,
  Title_SVG,
  Ul_El,
} from "./stnode/SpecialCtnrEl.ts";
import {
  Area_El,
  Base_El,
  Br_El,
  Col_El,
  Embed_El,
  Hr_El,
  Img_El,
  Input_El,
  Link_El,
  Meta_El,
  Source_El,
  Track_El,
  Wbr_El,
} from "./stnode/SpecialVoidEl.ts";
import { Tbody_El } from "./stnode/Tbody_El.ts";
import { Tr_El } from "./stnode/Tr_El.ts";
import type { Tag_LI } from "./util.ts";
/*80--------------------------------------------------------------------------*/

/** @headconst @param tk_x */
export const createEl_tk = (tk_x: HTMLTk): Elment => {
  /*#static*/ if (INOUT) {
    /* Not always `isOpntag`, e.g. `</br>` (although it's an error). */
    assert(tk_x.value === HTMLTok.tag);
  }
  /* deno-fmt-ignore */ switch ((tk_x.lexdInfo as Tag_LI).tagname_s) {
      /* SpecialVoidEl */
      case "area": return new Area_El(tk_x);
      case "base": return new Base_El(tk_x);
      case "br": return new Br_El(tk_x);
      case "col": return new Col_El(tk_x);
      case "embed": return new Embed_El(tk_x);
      case "hr": return new Hr_El(tk_x);
      case "img": return new Img_El(tk_x);
      case "image": return new Img_El(tk_x); // will `setErr()` in the caller
      case "input": return new Input_El(tk_x);
      case "link": return new Link_El(tk_x);
      case "meta": return new Meta_El(tk_x);
      case "source": return new Source_El(tk_x);
      case "track": return new Track_El(tk_x);
      case "wbr": return new Wbr_El(tk_x);
      /* ~ */

      /* SpecialCtnrEl */
      case "address": return new Address_El(tk_x);
      case "article": return new Article_El(tk_x);
      case "aside": return new Aside_El(tk_x);
      case "blockquote": return new Blockquote_El(tk_x);
      case "button": return new Button_El(tk_x);
      case "caption": return new Caption_El(tk_x);
      case "cite": return new Cite_El(tk_x);
      case "code": return new Code_El(tk_x);
      case "colgroup": return new Colgroup_El(tk_x);
      case "dd": return new Dd_El(tk_x);
      case "del": return new Del_El(tk_x);
      case "details": return new Details_El(tk_x);
      case "div": return new Div_El(tk_x);
      case "dl": return new Dl_El(tk_x);
      case "dt": return new Dt_El(tk_x);
      case "fieldset": return new Fieldset_El(tk_x);
      case "figcaption": return new Figcaption_El(tk_x);
      case "figure": return new Figure_El(tk_x);
      case "footer": return new Footer_El(tk_x);
      case "form": return new Form_El(tk_x);
      case "h1": return new H1_El(tk_x);
      case "h2": return new H2_El(tk_x);
      case "h3": return new H3_El(tk_x);
      case "h4": return new H4_El(tk_x);
      case "h5": return new H5_El(tk_x);
      case "h6": return new H6_El(tk_x);
      case "header": return new Header_El(tk_x);
      case "hgroup": return new Hgroup_El(tk_x);
      case "iframe": return new Iframe_El(tk_x);
      case "ins": return new Ins_El(tk_x);
      case "li": return new Li_El(tk_x);
      case "main": return new Main_El(tk_x);
      case "menu": return new Menu_El(tk_x);
      case "nav": return new Nav_El(tk_x);
      case "noscript": return new Noscript_El(tk_x);
      case "object": return new Object_El(tk_x);
      case "ol": return new Ol_El(tk_x);
      case "p": return new P_El(tk_x);
      case "pre": return new Pre_El(tk_x);
      case "script": return new Script_El(tk_x);
      case "search": return new Search_El(tk_x);
      case "section": return new Section_El(tk_x);
      case "select": return new Select_El(tk_x);
      case "style": return new Style_El(tk_x);
      case "summary": return new Summary_El(tk_x);
      case "table": return new Table_El(tk_x);
      case "tbody": return new Tbody_El(tk_x);
      case "td": return new Td_El(tk_x);
      case "template": return new Template_El(tk_x);
      case "textarea": return new Textarea_El(tk_x);
      case "tfoot": return new Tfoot_El(tk_x);
      case "th": return new Th_El(tk_x);
      case "thead": return new Thead_El(tk_x);
      case "title": return new Title_El(tk_x);
      case "tr": return new Tr_El(tk_x);
      case "ul": return new Ul_El(tk_x);
      
      case "svg foreignObject": return new ForeignObject_SVG(tk_x);
      case "svg desc": return new Desc_SVG(tk_x);
      case "svg title": return new Title_SVG(tk_x);

      case "math mi": return new I_MathML(tk_x);
      case "math mo": return new O_MathML(tk_x);
      case "math mn": return new N_MathML(tk_x);
      case "math ms": return new S_MathML(tk_x);
      case "math mtext": return new Text_MathML(tk_x);
      case "math annotation-xml": return new AnnotationXml_MathML(tk_x);
      /* ~ */

      /* OrdinaryCtnrEl */
      case "abbr": return new Abbr_El(tk_x);
      case "audio": return new Audio_El(tk_x);
      case "bdi": return new Bdi_El(tk_x);
      case "bdo": return new Bdo_El(tk_x);
      case "canvas": return new Canvas_El(tk_x);
      case "data": return new Data_El(tk_x);
      case "dfn": return new Dfn_El(tk_x);
      case "dialog": return new Dialog_El(tk_x);
      case "kbd": return new Kbd_El(tk_x);
      case "label": return new Label_El(tk_x);
      case "legend": return new Legend_El(tk_x);
      case "map": return new Map_El(tk_x);
      case "mark": return new Mark_El(tk_x);
      case "meter": return new Meter_El(tk_x);
      case "option": return new Option_El(tk_x);
      case "optgroup": return new Optgroup_El(tk_x);
      case "output": return new Output_El(tk_x);
      case "picture": return new Picture_El(tk_x);
      case "progress": return new Progress_El(tk_x);
      case "q": return new Q_El(tk_x);
      case "rp": return new Rp_El(tk_x);
      case "rt": return new Rt_El(tk_x);
      case "samp": return new Samp_El(tk_x);
      case "selectedcontent": return new Selectedcontent_El(tk_x);
      case "slot": return new Slot_El(tk_x);
      case "span": return new Span_El(tk_x);
      case "sub": return new Sub_El(tk_x);
      case "sup": return new Sup_El(tk_x);
      case "time": return new Time_El(tk_x);
      case "var": return new Var_El(tk_x);
      case "video": return new Video_El(tk_x);
      
      /* 2 OrdinaryForeignEl ("void") */
      case "svg animate": return new Animate_SVG(tk_x);
      case "svg animatemotion": return new AnimateMotion_SVG(tk_x);
      case "svg animatetransform": return new AnimateTransform_SVG(tk_x);
      case "svg circle": return new Circle_SVG(tk_x);
      case "svg ellipse": return new Ellipse_SVG(tk_x);
      case "svg line": return new Line_SVG(tk_x);
      case "svg feblend": return new FeBlend_SVG(tk_x);
      case "svg fecolormatrix": return new FeColorMatrix_SVG(tk_x);
      case "svg fecomposite": return new FeComposite_SVG(tk_x);
      case "svg feconvolvematrix": return new FeConvolveMatrix_SVG(tk_x);
      case "svg fedisplacementmap": return new FeDisplacementMap_SVG(tk_x);
      case "svg fedistantlight": return new FeDistantLight_SVG(tk_x);
      case "svg fedropshadow": return new FeDropShadow_SVG(tk_x);
      case "svg feflood": return new FeFlood_SVG(tk_x);
      case "svg fegaussianblur": return new FeGaussianBlur_SVG(tk_x);
      case "svg feimage": return new FeImage_SVG(tk_x);
      case "svg femergenode": return new FeMergeNode_SVG(tk_x);
      case "svg femorphology": return new FeMorphology_SVG(tk_x);
      case "svg feoffset": return new FeOffset_SVG(tk_x);
      case "svg fepointlight": return new FePointLight_SVG(tk_x);
      case "svg fespotlight": return new FeSpotLight_SVG(tk_x);
      case "svg fetile": return new FeTile_SVG(tk_x);
      case "svg feturbulence": return new FeTurbulence_SVG(tk_x);
      case "svg image": return new Image_SVG(tk_x);
      case "svg mpath": return new Mpath_SVG(tk_x);
      case "svg path": return new Path_SVG(tk_x);
      case "svg polygon": return new Polygon_SVG(tk_x);
      case "svg polyline": return new Polyline_SVG(tk_x);
      case "svg rect": return new Rect_SVG(tk_x);
      case "svg set": return new Set_SVG(tk_x);
      case "svg stop": return new Stop_SVG(tk_x);
      case "svg use": return new Use_SVG(tk_x);
      case "svg view": return new View_SVG(tk_x);
      /* 2 ~ */

      /* 2 OrdinaryForeignEl */
      case "svg a": return new A_SVG(tk_x);
      case "svg clippath": return new ClipPath_SVG(tk_x);
      case "svg defs": return new Defs_SVG(tk_x);
      case "svg fecomponenttransfer": return new FeComponentTransfer_SVG(tk_x);
      case "svg fediffuselighting": return new FeDiffuseLighting_SVG(tk_x);
      case "svg fefunca": return new FeFuncA_SVG(tk_x);
      case "svg fefuncb": return new FeFuncB_SVG(tk_x);
      case "svg fefuncg": return new FeFuncG_SVG(tk_x);
      case "svg fefuncr": return new FeFuncR_SVG(tk_x);
      case "svg femerge": return new FeMerge_SVG(tk_x);
      case "svg fespecularlighting": return new FeSpecularLighting_SVG(tk_x);
      case "svg filter": return new Filter_SVG(tk_x);
      case "svg g": return new G_SVG(tk_x);
      case "svg lineargradient": return new LinearGradient_SVG(tk_x);
      case "svg marker": return new Marker_SVG(tk_x);
      case "svg mask": return new Mask_SVG(tk_x);
      case "svg metadata": return new Metadata_SVG(tk_x);
      case "svg pattern": return new Pattern_SVG(tk_x);
      case "svg radialgradient": return new RadialGradient_SVG(tk_x);
      case "svg script": return new Script_SVG(tk_x);
      case "svg style": return new Style_SVG(tk_x);
      case "svg svg": return new Svg_SVG(tk_x);
      case "svg switch": return new Switch_SVG(tk_x);
      case "svg symbol": return new Symbol_SVG(tk_x);
      case "svg text": return new Text_SVG(tk_x);
      case "svg textpath": return new TextPath_SVG(tk_x);
      case "svg tspan": return new Tspan_SVG(tk_x);

      case "math annotation": return new Annotation_MathML(tk_x);
      case "math merror": return new Error_MathML(tk_x);
      case "math mfrac": return new Frac_MathML(tk_x);
      case "math math": return new Math_MathML(tk_x);
      case "math mmultiscripts": return new Multiscripts_MathML(tk_x);
      case "math mover": return new Over_MathML(tk_x);
      case "math mpadded": return new Padded_MathML(tk_x);
      case "math mphantom": return new Phantom_MathML(tk_x);
      case "math mprescripts": return new Prescripts_MathML(tk_x);
      case "math mroot": return new Root_MathML(tk_x);
      case "math mrow": return new Row_MathML(tk_x);
      case "math semantics": return new Semantics_MathML(tk_x);
      case "math mspace": return new Space_MathML(tk_x);
      case "math msqrt": return new Sqrt_MathML(tk_x);
      case "math mstyle": return new Style_MathML(tk_x);
      case "math msub": return new Sub_MathML(tk_x);
      case "math msubsup": return new Subsup_MathML(tk_x);
      case "math msup": return new Sup_MathML(tk_x);
      case "math mtable": return new Table_MathML(tk_x);
      case "math mtd": return new Td_MathML(tk_x);
      case "math mtr": return new Tr_MathML(tk_x);
      case "math munder": return new Under_MathML(tk_x);
      case "math munderover": return new Underover_MathML(tk_x);
      /* 2 ~ */
      /* ~ */

      default: return new Unknown_El((tk_x.lexdInfo as Tag_LI).tagname_s, tk_x);
    }
  //jjjj TOCLEANUP
  // return /*#static*/ DEBUG ? fail("Should not run here!") : Elment.mock(tk_x);
};

/**
 * @const @param srcTk_x
 * @headconst @param tgtEl_x
 */
export const tfrAttrs = (srcTk_x: HTMLTk, tgtEl_x: Elment): void => {
  /*#static*/ if (INOUT) {
    assert(srcTk_x.isOpntag);
  }
  const srcAttrs = (srcTk_x.lexdInfo as Tag_LI).attrs;
  const tgtAttrs = tgtEl_x.attrs_$;
  for (let i = 0, iI = srcAttrs.an_a.length; i < iI; i++) {
    if (!tgtAttrs.hasAn(srcAttrs.an_a[i])) {
      tgtAttrs.addAttr(srcAttrs.ran_a[i]);
    }
  }
  tgtAttrs.crTk_a.push(...srcAttrs.crTk_a);

  srcAttrs.ran_a.length = 0; // to prevent `Ran.rev()` twice
  srcAttrs.crTk_a.length = 0; // ditto
};
/*80--------------------------------------------------------------------------*/
